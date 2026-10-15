/* Fixed-purpose, Linux hosted owner. No runtime/kernel action occurs on import.
 * Compile only in the separately admitted hosted capability capsule. */
#ifndef _GNU_SOURCE
#define _GNU_SOURCE 1
#endif
#include <errno.h>
#include <fcntl.h>
#include <grp.h>
#include <linux/capability.h>
#include <linux/sched.h>
#include <linux/securebits.h>
#include <poll.h>
#include <signal.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/prctl.h>
#include <sys/stat.h>
#include <sys/syscall.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <time.h>
#include <unistd.h>

enum { FORCE_MS = 1000, FINISH_MS = 2000, MAX_CONTROL = 128, MAX_CAPTURE = 16384 };
struct session {
  char generation[37], source[65], unit[96], node[4096], repo[4096];
  char candidate[4096], cli[4096], home[4096], root[4096];
  uid_t uid; gid_t gid;
};
static struct session s;
static volatile sig_atomic_t interrupted;
static int journal = -1, parent = -1;
static bool refused, compatibility_done, application_done, capsule_done;
static void on_signal(int value) { (void)value; interrupted = 1; }
static int64_t now_ms(void) {
  struct timespec ts;
  if (clock_gettime(CLOCK_MONOTONIC, &ts) != 0) return -1;
  return (int64_t)ts.tv_sec * 1000 + ts.tv_nsec / 1000000;
}
static int durable(const char *event, const char *stage, int code) {
  char line[512];
  int n = snprintf(line, sizeof(line), "{\"generation\":\"%s\",\"event\":\"%s\",\"stage\":\"%s\",\"code\":%d}\n", s.generation, event, stage, code);
  return n > 0 && (size_t)n < sizeof(line) && write(journal, line, (size_t)n) == n && fsync(journal) == 0 ? 0 : -1;
}
static int root_regular(int fd, mode_t mode) {
  struct stat st;
  return fstat(fd, &st) == 0 && S_ISREG(st.st_mode) && st.st_uid == 0 && (st.st_mode & 0777) == mode;
}
static bool token(const char *value, size_t length, const char *alphabet) {
  return strlen(value) == length && strspn(value, alphabet) == length;
}
static bool absolute(const char *p) {
  return p[0] == '/' && !strstr(p, "/../") && !strstr(p, "/./") && !strchr(p, '\n') && !strchr(p, '\r');
}
/* Exact root-written ordered record; no arbitrary command/env/PID/cgroup input. */
static int load_session(const char *path) {
  int fd = open(path, O_RDONLY | O_NOFOLLOW | O_CLOEXEC);
  if (fd < 0 || !root_regular(fd, 0600)) { if (fd >= 0) close(fd); return -1; }
  FILE *f = fdopen(fd, "r");
  if (!f) { close(fd); return -1; }
  char *values[] = {s.generation,s.source,s.unit,s.node,s.repo,s.candidate,s.cli,s.home,s.root};
  size_t sizes[] = {sizeof(s.generation),sizeof(s.source),sizeof(s.unit),sizeof(s.node),sizeof(s.repo),sizeof(s.candidate),sizeof(s.cli),sizeof(s.home),sizeof(s.root)};
  const char *keys[] = {"generation","source","unit","node","repo","candidate","cli","home","root"};
  char line[8192]; int result = -1;
  for (size_t i = 0; i < 9; i++) {
    if (!fgets(line, sizeof(line), f)) goto done;
    char *eq = strchr(line, '='); if (!eq) goto done; *eq++ = 0;
    size_t n = strlen(eq); if (!n || eq[n-1] != '\n') goto done; eq[--n] = 0;
    if (strcmp(line, keys[i]) || !n || n >= sizes[i] || strchr(eq, '\r')) goto done;
    memcpy(values[i], eq, n+1);
  }
  unsigned uid = 0, gid = 0; char extra;
  if (!fgets(line,sizeof(line),f) || sscanf(line,"uid=%u%c",&uid,&extra) != 2 || extra != '\n') goto done;
  if (!fgets(line,sizeof(line),f) || sscanf(line,"gid=%u%c",&gid,&extra) != 2 || extra != '\n' || fgets(line,sizeof(line),f)) goto done;
  if (uid < 100 || gid < 100 || uid == 0 || gid == 0) goto done;
  s.uid = uid; s.gid = gid;
  if (!token(s.generation,36,"0123456789abcdef-") || !token(s.source,64,"0123456789abcdef") ||
      strncmp(s.unit,"kopplas-fixed-",14) || strspn(s.unit,"abcdefghijklmnopqrstuvwxyz0123456789-.") != strlen(s.unit)) goto done;
  for (size_t i=3;i<9;i++) if (!absolute(values[i])) goto done;
  if (strncmp(s.repo,s.root,strlen(s.root)) || s.repo[strlen(s.root)] != '/' ||
      strncmp(s.home,s.root,strlen(s.root)) || s.home[strlen(s.root)] != '/') goto done;
  struct stat st;
  if (lstat(s.root,&st) || !S_ISDIR(st.st_mode) || st.st_uid != 0 || (st.st_mode & 0777) != 0711) goto done;
  result = 0;
done: fclose(f); return result;
}
static int write_at(int dir, const char *file, const char *value) {
  int fd = openat(dir,file,O_WRONLY | O_CLOEXEC | O_NOFOLLOW);
  if (fd < 0) return -1;
  size_t length = strlen(value); int result = write(fd,value,length) == (ssize_t)length ? 0 : -1;
  close(fd); return result;
}
static int populated(int dir) {
  int fd = openat(dir,"cgroup.events",O_RDONLY | O_CLOEXEC | O_NOFOLLOW);
  if (fd < 0) return -1;
  char buf[256]; ssize_t n = pread(fd,buf,sizeof(buf)-1,0); close(fd);
  if (n <= 0) return -1;
  buf[n] = 0;
  if (!strncmp(buf,"populated 0\n",12)) return 0;
  if (!strncmp(buf,"populated 1\n",12)) return 1;
  return -1;
}
static int frozen(int dir) {
  int fd=openat(dir,"cgroup.events",O_RDONLY | O_CLOEXEC | O_NOFOLLOW);
  if(fd<0)return -1;
  char buf[256];ssize_t n=pread(fd,buf,sizeof(buf)-1,0);close(fd);
  if(n<=0)return -1;
  buf[n]=0;return strstr(buf,"\nfrozen 1\n") ? 1 : 0;
}
static int admitted_parent(void) {
  /* The service manager owns parent and broker subgroup; never accept a caller path. */
  FILE *f = fopen("/proc/self/cgroup","r"); if (!f) return -1;
  char record[4096];
  if (!fgets(record,sizeof(record),f) || strncmp(record,"0::/",4) || fgets((char[8]){0},8,f)) { fclose(f); return -1; }
  fclose(f); char *end = strchr(record,'\n'); if (!end) return -1; *end = 0;
  char *last = strrchr(record,'/'); if (!last || strcmp(last,"/broker")) return -1; *last = 0;
  char expected[128]; snprintf(expected,sizeof(expected),"/%s",s.unit);
  size_t r = strlen(record), e = strlen(expected);
  if (r < e || strcmp(record+r-e,expected)) return -1;
  char path[8192]; snprintf(path,sizeof(path),"/sys/fs/cgroup%s",record+3);
  int fd = open(path,O_RDONLY | O_DIRECTORY | O_NOFOLLOW | O_CLOEXEC);
  if (fd < 0) return -1;
  char type[32]; int t = openat(fd,"cgroup.type",O_RDONLY | O_NOFOLLOW | O_CLOEXEC);
  ssize_t n = t < 0 ? -1 : read(t,type,sizeof(type)); if (t >= 0) close(t);
  struct stat st;
  if (n != 7 || memcmp(type,"domain\n",7) || fstat(fd,&st) || st.st_uid != 0 || (st.st_mode & 0022)) { close(fd); return -1; }
  return fd;
}
/* CAPSULE-REFUSAL-BEGIN: one data-only marker on the existing nonblocking capture. */
enum capsule_boundary { CB_UNKNOWN, CB_STDIN_OPEN, CB_STDIN_DUP, CB_STDOUT_DUP, CB_NO_NEW_PRIVILEGES, CB_SECUREBITS, CB_AMBIENT_CLEAR, CB_BOUNDING_READ, CB_BOUNDING_DROP, CB_BOUNDING_LIMIT, CB_GROUPS_DROP, CB_GID_DROP, CB_UID_DROP, CB_CAPSET, CB_UID_CHECK, CB_EUID_CHECK, CB_GID_CHECK, CB_EGID_CHECK, CB_GROUPS_CHECK, CB_NO_NEW_PRIVILEGES_CHECK, CB_WORKLOAD_CHDIR, CB_FD_CLOSE_RANGE, CB_NODE_DIRECTORY_FORMAT, CB_NODE_PATH_LENGTH, CB_ENVIRONMENT_CLEAR, CB_ENV_HOME, CB_ENV_PATH, CB_ENV_CI, CB_ENV_DB_REQUIRED, CB_ENV_RUNTIME_TEMP, CB_ENV_BROWSER_PATH, CB_ENV_APP_MODE, CB_ENV_ATTESTATION_KEY, CB_ENV_ATTESTATION_SECRET, CB_NODE_EXEC, CB_COUNT };
static const char *const capsule_boundary_names[] = {"unknown", "stdin-open", "stdin-dup", "stdout-dup", "no-new-privileges", "securebits", "ambient-clear", "bounding-read", "bounding-drop", "bounding-limit", "groups-drop", "gid-drop", "uid-drop", "capset", "uid-check", "euid-check", "gid-check", "egid-check", "groups-check", "no-new-privileges-check", "workload-chdir", "fd-close-range", "node-directory-format", "node-path-length", "environment-clear", "env-home", "env-path", "env-ci", "env-db-required", "env-runtime-temp", "env-browser-path", "env-app-mode", "env-attestation-key", "env-attestation-secret", "node-exec" };
struct capsule_failure { enum capsule_boundary stage; int saved_errno; };
static int capsule_failed(struct capsule_failure *detail, enum capsule_boundary stage, int saved_errno) {
  if (detail) { detail->stage=stage; detail->saved_errno=saved_errno; }
  return -1;
}
static void capsule_exit125(bool capsule, int capture, bool stdout_ready, struct capsule_failure detail) {
  if (capsule) {
    const char *stage=detail.stage>CB_UNKNOWN && detail.stage<CB_COUNT ? capsule_boundary_names[detail.stage] : "unknown";
    char marker[192], error[16];
    if(detail.saved_errno>0)snprintf(error,sizeof(error),"%d",detail.saved_errno);else strcpy(error,"null");
    int n=snprintf(marker,sizeof(marker),"{\"schemaVersion\":1,\"kind\":\"owned-capsule-refusal\",\"stage\":\"%s\",\"errno\":%s}\n",stage,error);
    if(n>0 && (size_t)n<sizeof(marker))(void)write(stdout_ready?STDOUT_FILENO:capture,marker,(size_t)n);
  }
  _exit(125);
}
/* CAPSULE-REFUSAL-END */
static int drop_authority(struct capsule_failure *detail) {
  if(prctl(PR_SET_NO_NEW_PRIVS,1,0,0,0))return capsule_failed(detail,CB_NO_NEW_PRIVILEGES,errno);
  if(prctl(PR_SET_SECUREBITS,SECBIT_NOROOT | SECBIT_NOROOT_LOCKED | SECBIT_NO_SETUID_FIXUP | SECBIT_NO_SETUID_FIXUP_LOCKED))return capsule_failed(detail,CB_SECUREBITS,errno);
  if(prctl(PR_CAP_AMBIENT,PR_CAP_AMBIENT_CLEAR_ALL,0,0,0))return capsule_failed(detail,CB_AMBIENT_CLEAR,errno);
  int cap;
  for(cap=0;cap<1024;cap++) {
    if(prctl(PR_CAPBSET_READ,cap,0,0,0)<0) { if(errno==EINVAL)break;return capsule_failed(detail,CB_BOUNDING_READ,errno); }
    if(prctl(PR_CAPBSET_DROP,cap,0,0,0))return capsule_failed(detail,CB_BOUNDING_DROP,errno);
  }
  if(cap==1024)return capsule_failed(detail,CB_BOUNDING_LIMIT,0);
  if(setgroups(0,NULL))return capsule_failed(detail,CB_GROUPS_DROP,errno);
  if(setresgid(s.gid,s.gid,s.gid))return capsule_failed(detail,CB_GID_DROP,errno);
  if(setresuid(s.uid,s.uid,s.uid))return capsule_failed(detail,CB_UID_DROP,errno);
  struct __user_cap_header_struct h = {_LINUX_CAPABILITY_VERSION_3,0};
  struct __user_cap_data_struct d[2] = {{0},{0}};
  if(syscall(SYS_capset,&h,d))return capsule_failed(detail,CB_CAPSET,errno);
  if(getuid()!=s.uid)return capsule_failed(detail,CB_UID_CHECK,0);
  if(geteuid()!=s.uid)return capsule_failed(detail,CB_EUID_CHECK,0);
  if(getgid()!=s.gid)return capsule_failed(detail,CB_GID_CHECK,0);
  if(getegid()!=s.gid)return capsule_failed(detail,CB_EGID_CHECK,0);
  int groups=getgroups(0,NULL);
  if(groups!=0)return capsule_failed(detail,CB_GROUPS_CHECK,groups<0?errno:0);
  int privileges=prctl(PR_GET_NO_NEW_PRIVS,0,0,0,0);
  if(privileges!=1)return capsule_failed(detail,CB_NO_NEW_PRIVILEGES_CHECK,privileges<0?errno:0);
  return 0;
}
static const char *compatibility_script =
 "import {pathToFileURL} from 'node:url';const m=await import(pathToFileURL(process.argv[2]).href);"
 "const p=await import(pathToFileURL(process.argv[3]).href);"
 "const candidate=await p.admitCandidate(process.argv[4]);const packages=await p.packageAdmission();"
 "const compatibility=await m.runCompatibility(candidate.executable);"
 "process.stdout.write(JSON.stringify({candidate,packages:packages.provenance,compatibility}));";
static const char *capsule_script =
 "import{spawn}from'node:child_process';import{readFileSync}from'node:fs';const c=spawn(process.execPath,['-e','setInterval(()=>{},1000)'],"
 "{detached:true,stdio:'ignore'});c.once('spawn',()=>process.stdout.write(JSON.stringify({node:process.version,uid:process.getuid(),gid:process.getgid(),"
 "groups:process.getgroups(),status:readFileSync('/proc/self/status','utf8'),detached:true})));c.unref();setInterval(()=>{},1000);";
static void child_exec(int capture, bool application, bool capsule) {
  struct capsule_failure detail={CB_UNKNOWN,0};
  bool stdout_ready=false;
  int null_input=open("/dev/null",O_RDONLY | O_CLOEXEC);
  if(null_input<0) { detail=(struct capsule_failure){CB_STDIN_OPEN,errno};capsule_exit125(capsule,capture,stdout_ready,detail); }
  if(dup2(null_input,STDIN_FILENO)<0) { detail=(struct capsule_failure){CB_STDIN_DUP,errno};capsule_exit125(capsule,capture,stdout_ready,detail); }
  if(dup2(capture,STDOUT_FILENO)<0) { detail=(struct capsule_failure){CB_STDOUT_DUP,errno};capsule_exit125(capsule,capture,stdout_ready,detail); }
  stdout_ready=true;
  if(drop_authority(capsule?&detail:NULL))capsule_exit125(capsule,capture,stdout_ready,detail);
  if(chdir(s.repo)) { detail=(struct capsule_failure){CB_WORKLOAD_CHDIR,errno};capsule_exit125(capsule,capture,stdout_ready,detail); }
  if(syscall(SYS_close_range,3,~0U,0)<0) { detail=(struct capsule_failure){CB_FD_CLOSE_RANGE,errno};capsule_exit125(capsule,capture,stdout_ready,detail); }
  /* The root workflow writes only the sealed application fixture environment. */
  char node_path[8192];snprintf(node_path,sizeof(node_path),"%s",s.node);
  char *node_end=strrchr(node_path,'/');
  if(!node_end) { detail=(struct capsule_failure){CB_NODE_DIRECTORY_FORMAT,0};capsule_exit125(capsule,capture,stdout_ready,detail); }
  *node_end=0;
  if(strlen(node_path)+strlen(":/usr/local/bin:/usr/bin:/bin")>=sizeof(node_path)) { detail=(struct capsule_failure){CB_NODE_PATH_LENGTH,0};capsule_exit125(capsule,capture,stdout_ready,detail); }
  strcat(node_path,":/usr/local/bin:/usr/bin:/bin");
  if(clearenv()) { detail=(struct capsule_failure){CB_ENVIRONMENT_CLEAR,0};capsule_exit125(capsule,capture,stdout_ready,detail); }
  if(setenv("HOME",s.home,1)) { detail=(struct capsule_failure){CB_ENV_HOME,errno};capsule_exit125(capsule,capture,stdout_ready,detail); }
  if(setenv("PATH",node_path,1)) { detail=(struct capsule_failure){CB_ENV_PATH,errno};capsule_exit125(capsule,capture,stdout_ready,detail); }
  if(setenv("CI","true",1)) { detail=(struct capsule_failure){CB_ENV_CI,errno};capsule_exit125(capsule,capture,stdout_ready,detail); }
  if(setenv("SUPABASE_TEST_REQUIRED","1",1)) { detail=(struct capsule_failure){CB_ENV_DB_REQUIRED,errno};capsule_exit125(capsule,capture,stdout_ready,detail); }
  if(setenv("RUNNER_TEMP",s.root,1)) { detail=(struct capsule_failure){CB_ENV_RUNTIME_TEMP,errno};capsule_exit125(capsule,capture,stdout_ready,detail); }
  if(setenv("FIXED_CHROMIUM_EXECUTABLE",s.candidate,1)) { detail=(struct capsule_failure){CB_ENV_BROWSER_PATH,errno};capsule_exit125(capsule,capture,stdout_ready,detail); }
  if(setenv("KOPPLAS_FIXED_CHROMIUM_APPLICATION_MODE","verify-application",1)) { detail=(struct capsule_failure){CB_ENV_APP_MODE,errno};capsule_exit125(capsule,capture,stdout_ready,detail); }
  if(setenv("BOOKING_CONFLICT_ATTESTATION_KEY_ID","test_v1",1)) { detail=(struct capsule_failure){CB_ENV_ATTESTATION_KEY,errno};capsule_exit125(capsule,capture,stdout_ready,detail); }
  if(setenv("BOOKING_CONFLICT_ATTESTATION_HMAC_SECRET","local-test-only-booking-conflict-attestation-secret-v1",1)) { detail=(struct capsule_failure){CB_ENV_ATTESTATION_SECRET,errno};capsule_exit125(capsule,capture,stdout_ready,detail); }
  char runner[8192], probe[8192];
  snprintf(runner,sizeof(runner),"%s/tests/diagnostics/fixed-chromium-application-runner.mjs",s.repo);
  snprintf(probe,sizeof(probe),"%s/tests/diagnostics/no-store-stream-probe.mjs",s.repo);
  if (capsule) execl(s.node,s.node,"--input-type=module","-e",capsule_script,(char*)NULL);
  else if (application) execl(s.node,s.node,s.cli,"test","--config","playwright.fixed-chromium-application.config.ts",(char*)NULL);
  else execl(s.node,s.node,"--input-type=module","-e",compatibility_script,"fixed-chromium-compatibility",runner,probe,s.candidate,(char*)NULL);
  detail=(struct capsule_failure){CB_NODE_EXEC,errno};capsule_exit125(capsule,capture,stdout_ready,detail);
}
static void quoted(const char *value) {
  putchar('"'); for (const unsigned char *p=(const unsigned char*)value;*p;p++) {
    if (*p=='"'||*p=='\\') { putchar('\\'); putchar(*p); }
    else if (*p<32) printf("\\u%04x",*p); else putchar(*p);
  } putchar('"');
}
/* Returns only after a durable actual leader-reaped AND retained same-leaf empty fence,
 * or bounded explicit failure. Leaves are retained; no rmdir/cleanup-success assumption. */
static int stage(const char *name, bool application, bool capsule) {
  if (refused || interrupted || mkdirat(parent,name,0700)) return -1;
  int leaf=openat(parent,name,O_RDONLY | O_DIRECTORY | O_NOFOLLOW | O_CLOEXEC), pipefd[2];
  if (leaf<0 || populated(leaf)!=0 || write_at(leaf,"cgroup.freeze","1") || frozen(leaf)!=1 || pipe2(pipefd,O_CLOEXEC | O_NONBLOCK)) { if(leaf>=0)close(leaf); refused=true; return -1; }
  int pidfd=-1;
  struct clone_args args={.flags=CLONE_INTO_CGROUP | CLONE_PIDFD,.pidfd=(uintptr_t)&pidfd,.exit_signal=SIGCHLD,.cgroup=(uint64_t)leaf};
  pid_t pid=(pid_t)syscall(SYS_clone3,&args,sizeof(args));
  if(pid==0) { close(pipefd[0]); child_exec(application ? STDERR_FILENO : pipefd[1],application,capsule); }
  close(pipefd[1]);
  if(pid<0 || pidfd<0) { close(pipefd[0]);close(leaf);refused=true;return -1; }
  if(durable("born",name,0) || write_at(leaf,"cgroup.freeze","0")) refused=true;
  int64_t started=now_ms(), refusal=refused?started:-1;
  const int timeout=capsule?250:(application?1500000:15000);
  bool reaped=false,killed=false,residue=false,empty=false,read_failed=false;
  bool expected_capsule_stop=false;
  int code=-1, sig=0; char output[MAX_CAPTURE+1]; size_t used=0; output[0]=0;
  for(;;) {
    int64_t now=now_ms(); if(now<0) { refused=true;break; }
    struct pollfd p[2]={{.fd=STDIN_FILENO,.events=POLLIN | POLLHUP},{.fd=pipefd[0],.events=POLLIN | POLLHUP}};
    (void)poll(p,2,5);
    if(interrupted || (p[0].revents & (POLLIN | POLLHUP | POLLERR)) || now-started>=timeout) {
      if(refusal<0) {
        expected_capsule_stop=capsule && !interrupted && !p[0].revents && now-started>=timeout;
        refusal=now;refused=true;
        if(syscall(SYS_pidfd_send_signal,pidfd,SIGTERM,NULL,0)<0 && errno!=ESRCH)read_failed=true;
        if(durable("refused",name,1))read_failed=true;
      }
    }
    char chunk[1024];ssize_t n;
    while((n=read(pipefd[0],chunk,sizeof(chunk)))>0) {
      if(used+(size_t)n>MAX_CAPTURE) { if(refusal<0){refusal=now;refused=true;(void)syscall(SYS_pidfd_send_signal,pidfd,SIGTERM,NULL,0);} }
      else {memcpy(output+used,chunk,(size_t)n);used+=(size_t)n;output[used]=0;}
    }
    if(!reaped) {
      siginfo_t info={0};
      if(waitid(P_PIDFD,(id_t)pidfd,&info,WEXITED | WNOHANG)<0) {refused=true;read_failed=true;}
      else if(info.si_pid) {reaped=true;code=info.si_code==CLD_EXITED?info.si_status:-1;sig=info.si_code==CLD_EXITED?0:info.si_status;}
    }
    int pop=populated(leaf); if(pop<0) {read_failed=true;refused=true;if(refusal<0)refusal=now;}
    empty=pop==0;
    if(reaped && !empty && refusal<0) {residue=true;refused=true;refusal=now;}
    if(refusal>=0 && !killed && now-refusal>=FORCE_MS) {killed=true;if(write_at(leaf,"cgroup.kill","1"))read_failed=true;}
    if(reaped && empty && !read_failed) break;
    if(refusal>=0 && now-refusal>=FINISH_MS) {refused=true;break;}
  }
  bool confirmed=reaped && empty && !read_failed;
  if(durable(confirmed?"confirmed":"unconfirmed",name,confirmed?0:1)) confirmed=false;
  printf("{\"event\":\"stage\",\"generation\":\"%s\",\"stage\":\"%s\",\"code\":%d,\"signal\":%d,\"expired\":%s,\"reaped\":%s,\"empty\":%s,\"confirmed\":%s,\"residue\":%s,\"output\":",s.generation,name,code,sig,refusal>=0?"true":"false",reaped?"true":"false",empty?"true":"false",confirmed?"true":"false",residue?"true":"false");
  quoted(output); puts("}");fflush(stdout);
  close(pipefd[0]);close(pidfd);close(leaf);
  if(capsule && expected_capsule_stop && confirmed && !residue)refused=false;
  return confirmed && !residue && (capsule || refusal<0) ? 0 : -1;
}
int main(int argc,char **argv) {
  if(argc!=3 || strcmp(argv[1],"--admitted-session") || geteuid()!=0 || load_session(argv[2])) return 125;
  signal(SIGPIPE,SIG_IGN); struct sigaction action={.sa_handler=on_signal};sigemptyset(&action.sa_mask);
  if(sigaction(SIGINT,&action,NULL)||sigaction(SIGTERM,&action,NULL))return 125;
  parent=admitted_parent(); if(parent<0)return 125;
  char path[8192];snprintf(path,sizeof(path),"%s/control",s.root);
  int control=open(path,O_RDONLY | O_DIRECTORY | O_NOFOLLOW | O_CLOEXEC);struct stat st;
  if(control<0||fstat(control,&st)||st.st_uid!=0||(st.st_mode&0777)!=0700)return 125;
  journal=openat(control,"ownership.jsonl",O_WRONLY | O_APPEND | O_CREAT | O_EXCL | O_NOFOLLOW | O_CLOEXEC,0600);
  if(journal<0||fsync(control)||durable("registered","none",0))return 125;
  printf("{\"event\":\"ready\",\"generation\":\"%s\",\"source\":\"%s\",\"unit\":\"%s\",\"durable\":true,\"workloads\":0}\n",s.generation,s.source,s.unit);fflush(stdout);
  char command[MAX_CONTROL];
  while(!refused && !interrupted) {
    if(!fgets(command,sizeof(command),stdin)) {refused=true;break;}
    if(!strcmp(command,"COMPATIBILITY\n")&&!compatibility_done&&!application_done) {compatibility_done=true;if(stage("compatibility",false,false))refused=true;}
    else if(!strcmp(command,"APPLICATION\n")&&compatibility_done&&!application_done&&!capsule_done) {application_done=true;if(stage("application",true,false))refused=true;}
    else if(!strcmp(command,"CAPABILITY\n")&&!compatibility_done&&!application_done) {compatibility_done=true;capsule_done=true;if(stage("capsule",false,true))refused=true;}
    else if(!strcmp(command,"FINISH\n"))break;
    else refused=true;
  }
  (void)durable(refused?"failed":"finished","none",refused?1:0);
  close(journal);close(control);close(parent);return refused?1:0;
}
