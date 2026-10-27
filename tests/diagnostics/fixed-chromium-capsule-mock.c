/* Portable mock ONLY. No Linux entry/main/stage/session loader is compiled. */
#include <stdbool.h>
#include <stdint.h>
#include <stddef.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdarg.h>
#include <setjmp.h>
#include <errno.h>
typedef unsigned int uid_t; typedef unsigned int gid_t; typedef ptrdiff_t ssize_t;
#define STDIN_FILENO 0
#define STDOUT_FILENO 1
#define O_RDONLY 0
#define O_CLOEXEC 0x80000
#define PR_SET_NO_NEW_PRIVS 1
#define PR_SET_SECUREBITS 2
#define PR_CAP_AMBIENT 3
#define PR_CAPBSET_READ 4
#define PR_CAPBSET_DROP 5
#define PR_GET_NO_NEW_PRIVS 6
#define PR_CAP_AMBIENT_CLEAR_ALL 1
#define SECBIT_NOROOT 1
#define SECBIT_NOROOT_LOCKED 2
#define SECBIT_NO_SETUID_FIXUP 4
#define SECBIT_NO_SETUID_FIXUP_LOCKED 8
#define _LINUX_CAPABILITY_VERSION_3 3
#define SYS_capset 1
#define SYS_close_range 2
struct __user_cap_header_struct { unsigned int version; int pid; };
struct __user_cap_data_struct { unsigned int effective,permitted,inheritable; };
struct session { char node[4096],repo[4096],candidate[4096],cli[4096],home[4096],root[4096];uid_t uid;gid_t gid; };
static struct session s;
static jmp_buf transfer;
static int target, saved_exit, writes, bad, unavailable, seen_failure, calls, after_failure;
static int trace[4096], last_write_fd;
static char requested[192];
static int requested_count;
static char marker[192];
static int mock_errno;
static int step(int stage){if(seen_failure)after_failure++;if(calls>=4096){bad++;return 1;}trace[calls++]=stage;if(stage==target){seen_failure=1;mock_errno=13;return 1;}return 0;}
static int m_open(const char *path,int flags);
static int m_dup2(int from,int to);
static int m_prctl(int op,...);
static int m_setgroups(size_t count,const gid_t *groups);
static int m_setresgid(gid_t a,gid_t b,gid_t z);
static int m_setresuid(uid_t a,uid_t b,uid_t z);
static long m_syscall(long op,...);
static uid_t m_getuid(void);static uid_t m_geteuid(void);
static gid_t m_getgid(void);static gid_t m_getegid(void);
static int m_getgroups(int count,gid_t *groups);
static int m_chdir(const char *path);static int m_clearenv(void);
static int m_setenv(const char *key,const char *value,int replace);
static int m_execl(const char *path,const char *arg,...);
static ssize_t m_write(int fd,const void *bytes,size_t count);
static void m_exit(int code);
static size_t m_strlen(const char *value){if(value[0]=='/'){(void)step(23);if(target==23)return 9999;}return strlen(value);}
static char *m_strrchr(const char *value,int needle){char *found=strrchr(value,needle);(void)step(22);return found;}
#undef errno
#define errno mock_errno
#define open m_open
#define dup2 m_dup2
#define prctl m_prctl
#define setgroups m_setgroups
#define setresgid m_setresgid
#define setresuid m_setresuid
#define syscall m_syscall
#define getuid m_getuid
#define geteuid m_geteuid
#define getgid m_getgid
#define getegid m_getegid
#define getgroups m_getgroups
#define chdir m_chdir
#define clearenv m_clearenv
#define setenv m_setenv
#define execl m_execl
#define write m_write
#define _exit m_exit
#define strlen m_strlen
#define strrchr m_strrchr
/* OWNED-CAPSULE-ACTUAL-SOURCE */

#undef strlen
#undef strrchr
static int m_open(const char *value,int flags){if(strcmp(value,"/dev/null")||flags!=(O_RDONLY|O_CLOEXEC))bad++;return step(CB_STDIN_OPEN)?-1:9;}
static int m_dup2(int from,int to){if((to==0&&from!=9)||(to==1&&from!=77)||(to!=0&&to!=1))bad++;return step(to==0?CB_STDIN_DUP:CB_STDOUT_DUP)?-1:to;}
static int m_prctl(int op,...){va_list a;va_start(a,op);int value=va_arg(a,int);
 int stage=0;switch(op){case PR_SET_NO_NEW_PRIVS:stage=CB_NO_NEW_PRIVILEGES;if(value!=1)bad++;break;case PR_SET_SECUREBITS:stage=CB_SECUREBITS;if(value!=(SECBIT_NOROOT|SECBIT_NOROOT_LOCKED|SECBIT_NO_SETUID_FIXUP|SECBIT_NO_SETUID_FIXUP_LOCKED))bad++;break;case PR_CAP_AMBIENT:stage=CB_AMBIENT_CLEAR;if(value!=PR_CAP_AMBIENT_CLEAR_ALL)bad++;break;case PR_CAPBSET_READ:stage=CB_BOUNDING_READ;break;case PR_CAPBSET_DROP:stage=CB_BOUNDING_DROP;break;case PR_GET_NO_NEW_PRIVS:stage=CB_NO_NEW_PRIVILEGES_CHECK;if(value!=0)bad++;break;default:bad++;}
 if(op!=PR_SET_SECUREBITS){for(int i=0;i<3;i++){if(va_arg(a,int)!=0)bad++;}}va_end(a);
 if(step(stage))return -1;
 if(op==PR_CAPBSET_READ&&target!=CB_BOUNDING_LIMIT&&value==1){mock_errno=EINVAL;return -1;}
 if(op==PR_CAPBSET_DROP&&target==CB_BOUNDING_LIMIT&&value==1023)seen_failure=1;
 return op==PR_GET_NO_NEW_PRIVS?1:0;}
static int m_setgroups(size_t count,const gid_t *groups){if(count||groups)bad++;return step(CB_GROUPS_DROP)?-1:0;}
static int m_setresgid(gid_t a,gid_t b,gid_t z){if(a!=s.gid||b!=s.gid||z!=s.gid)bad++;return step(CB_GID_DROP)?-1:0;}
static int m_setresuid(uid_t a,uid_t b,uid_t z){if(a!=s.uid||b!=s.uid||z!=s.uid)bad++;return step(CB_UID_DROP)?-1:0;}
static long m_syscall(long op,...){va_list a;va_start(a,op);if(op==SYS_capset){struct __user_cap_header_struct *h=va_arg(a,struct __user_cap_header_struct *);struct __user_cap_data_struct *d=va_arg(a,struct __user_cap_data_struct *);if(h->version!=_LINUX_CAPABILITY_VERSION_3||h->pid)bad++;for(int i=0;i<2;i++){if(d[i].effective||d[i].permitted||d[i].inheritable)bad++;}}else if(op==SYS_close_range){if(va_arg(a,int)!=3||va_arg(a,unsigned int)!=~0U||va_arg(a,int)!=0)bad++;}else{bad++;}va_end(a);return step(op==SYS_capset?CB_CAPSET:CB_FD_CLOSE_RANGE)?-1:0;}
static uid_t m_getuid(void){return step(CB_UID_CHECK)?0:s.uid;}
static uid_t m_geteuid(void){return step(CB_EUID_CHECK)?0:s.uid;}
static gid_t m_getgid(void){return step(CB_GID_CHECK)?0:s.gid;}
static gid_t m_getegid(void){return step(CB_EGID_CHECK)?0:s.gid;}
static int m_getgroups(int count,gid_t *groups){if(count||groups)bad++;return step(CB_GROUPS_CHECK)?1:0;}
static int m_chdir(const char *value){if(strcmp(value,s.repo))bad++;return step(CB_WORKLOAD_CHDIR)?-1:0;}
static int m_clearenv(void){return step(CB_ENVIRONMENT_CLEAR)?-1:0;}
static int m_setenv(const char *key,const char *value,int replace){const char *keys[]={"HOME","PATH","CI","SUPABASE_TEST_REQUIRED","RUNNER_TEMP","FIXED_CHROMIUM_EXECUTABLE","KOPPLAS_FIXED_CHROMIUM_APPLICATION_MODE","BOOKING_CONFLICT_ATTESTATION_KEY_ID","BOOKING_CONFLICT_ATTESTATION_HMAC_SECRET"};const char *values[]={s.home,"/node:/usr/local/bin:/usr/bin:/bin","true","1",s.root,s.candidate,"verify-application","test_v1","local-test-only-booking-conflict-attestation-secret-v1"};
 for(int i=0;i<9;i++){if(!strcmp(key,keys[i])){if(!value||strcmp(value,values[i])||replace!=1)bad++;return step(CB_ENV_HOME+i)?-1:0;}}bad++;return -1;}
static int m_execl(const char *value,const char *arg,...){va_list a;va_start(a,arg);const char *one=va_arg(a,const char *),*two=va_arg(a,const char *),*script=va_arg(a,const char *),*stop=va_arg(a,const char *);va_end(a);if(strcmp(value,s.node)||strcmp(arg,s.node)||strcmp(one,"--input-type=module")||strcmp(two,"-e")||script!=capsule_script||stop)bad++;if(step(CB_NODE_EXEC))return -1;longjmp(transfer,2);return -1;}
static ssize_t m_write(int fd,const void *bytes,size_t count){writes++;last_write_fd=fd;requested_count=(int)count;if(count==0||count>=sizeof(marker))bad++;if(count<sizeof(marker)){memcpy(requested,bytes,count);requested[count]=0;if(!unavailable){memcpy(marker,bytes,count);marker[count]=0;}}mock_errno=99;return unavailable==1?-1:unavailable==2?0:(ssize_t)count;}
static void m_exit(int code){saved_exit=code;longjmp(transfer,1);}
static void reset(int wanted,int delivery){memset(&s,0,sizeof(s));strcpy(s.node,wanted==CB_NODE_DIRECTORY_FORMAT?"noslash":"/node/node");strcpy(s.repo,"/fake/work");strcpy(s.home,"/fake/home");strcpy(s.root,"/fake");strcpy(s.candidate,"/fake/browser");strcpy(s.cli,"/fake/cli");s.uid=s.gid=1001;target=wanted;unavailable=delivery;saved_exit=writes=bad=seen_failure=calls=after_failure=requested_count=0;mock_errno=0;marker[0]=requested[0]=0;}
static int ordered(int wanted){int expected[4096],n=0;for(int i=1;i<=6;i++)expected[n++]=i;if(wanted==CB_BOUNDING_LIMIT){for(int i=0;i<1024;i++){expected[n++]=CB_BOUNDING_READ;expected[n++]=CB_BOUNDING_DROP;}}else{expected[n++]=CB_BOUNDING_READ;expected[n++]=CB_BOUNDING_DROP;expected[n++]=CB_BOUNDING_READ;for(int i=CB_GROUPS_DROP;i<CB_COUNT;i++)expected[n++]=i;}
 int stop=n;if(wanted&&wanted!=CB_BOUNDING_LIMIT){for(int i=0;i<n;i++){if(expected[i]==wanted){stop=i+1;break;}}}if(calls!=stop)return 0;for(int i=0;i<stop;i++){if(trace[i]!=expected[i])return 0;}return 1;}
static int test_case(int wanted,int delivery){reset(wanted,delivery);int event=setjmp(transfer);if(!event)child_exec(77,false,true);if(!wanted)return event==2&&writes==0&&bad==0&&ordered(wanted)&&after_failure==0?0:1;
 int predicate=wanted==CB_BOUNDING_LIMIT||wanted==CB_UID_CHECK||wanted==CB_EUID_CHECK||wanted==CB_GID_CHECK||wanted==CB_EGID_CHECK||wanted==CB_GROUPS_CHECK||wanted==CB_NODE_DIRECTORY_FORMAT||wanted==CB_NODE_PATH_LENGTH||wanted==CB_ENVIRONMENT_CLEAR;char expected[192];int n=snprintf(expected,sizeof(expected),"{\"schemaVersion\":1,\"kind\":\"owned-capsule-refusal\",\"stage\":\"%s\",\"errno\":%s}\n",capsule_boundary_names[wanted],predicate?"null":"13");
 if(event!=1||saved_exit!=125||writes!=1||bad||after_failure||!ordered(wanted)||last_write_fd!=(wanted<=CB_STDOUT_DUP?77:1)||n!=requested_count||strcmp(requested,expected)){return 1;}
 if(delivery?marker[0]!=0:strcmp(marker,expected)!=0)return 1;return 0;}
int main(void){int failed=0;for(int stage=1;stage<CB_COUNT;stage++){int result=test_case(stage,0);failed+=result;printf("case %02d %s %s\n",stage,capsule_boundary_names[stage],result?"FAIL":"PASS");}int delivery=test_case(CB_NODE_EXEC,1)|test_case(CB_NODE_EXEC,2);failed+=delivery;printf("case 35 delivery-unavailable %s\n",delivery?"FAIL":"PASS");int success=test_case(CB_UNKNOWN,0);failed+=success;printf("case 36 mock-exec-success %s\n",success?"FAIL":"PASS");printf("mock_cases=36 failures=%d skipped=0 native_actions=0\n",failed);return failed?1:0;}
