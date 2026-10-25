# Story 15.6 current native closeout

Tested source: `b57de61075646820ce9cb5feff7fd054fd2f8320`; [normal CI run 40192543175](https://github.com/rthunborg/Kopplas/actions/runs/40192543175).

Independent High qualification confirms all 63 new cases and all 95 retained calendar cases passed without skips. All 23 core browser cases passed on retry 0. Global unit TAP: 3,483 passed, zero failed/skipped; the named Linux-xattr test passed. The separate isolated recovery assertion passed. Current DB/browser scoped keys were deleted and clients closed, with no retained current custody.

The integration lane retains 52 explicit inherited skips with zero coverage credit. Two other smoke cases (16.1-E03 and 15.4-E2E-002) passed on retry 1 after response-body protocol errors and remain recorded as flaky. Historical failures and custody limitations are preserved.

Only safe projections, immutable object/digest provenance and qualifications are published here. The complete safe private projections remain referenced by digest; raw logs/ZIPs were not persisted by Root. Author delivery, Root gates, epic acceptance, final PR review, merge containment and release validation remain separate. `release_ready=false`; no deployment.
