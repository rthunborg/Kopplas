# Synthetic image-input probe

This bounded local pilot tests whether the independent reviewer actually receives
and can distinguish two PNG image inputs. It does not run an application, call an
external paid inference API, use credentials, or publish anything.

The two geometric fixtures were generated with Python's standard library. Their
byte hashes and 360×240 dimensions are in `manifest.json`. They are deliberately
different. The independent reviewer must open both image files, describe the
observed differences, and record its provider/model, paths, hashes and limitations
in `independent-image-probe.md`. A text-only reading of this directory does not
establish image input capability.

These images are **not** approved design references, application screenshots,
production-server captures, or evidence of desktop/360×640 product coverage.
Their comparison must not grant frontend acceptance or populate the approved
reference registry. Real frontend work still needs the gate's complete reference,
capture, coverage and acceptance records. This tooling-only setup has visual UI
evidence N/A because it changes no product UI; the probe is separate tooling proof.

Route: ordinary coordination/fixture preparation uses Sol Low; the independent
probe and sensitive gate review use separately dispatched Sol High. A successful
in-session probe establishes only this review session's ability to inspect these
images. It does not qualify a hosted provider, configure unattended review, or
establish API billing entitlement. The hosted remediation pilot remains separate.
