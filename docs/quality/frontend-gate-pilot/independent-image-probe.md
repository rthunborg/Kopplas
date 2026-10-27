# Independent synthetic image-input capability probe

Date: 2026-10-26. Reviewer: independent `gpt-6.1-sol` High delegate,
OpenAI through this Codex session. Scope: geometric fixture only.

## Method and identity

I opened both PNG files with `view_image` and received their rendered pixels as
image inputs before reading the manifest. I did not inspect the generator or
receive an expected-difference description. SHA-256 values were then computed
independently from the files and matched the manifest:

| Image | SHA-256 |
| --- | --- |
| `docs/quality/frontend-gate-pilot/synthetic-reference.png` | `ab79f81f4be7c639ad7c49e333fde6aa886fd8274d6be8f440fcbc85bb419341` |
| `docs/quality/frontend-gate-pilot/synthetic-actual.png` | `14b6b8dda357bc54403f4fdbc999576e8b55ed787dcf4f512fa63fb18b21cf7c` |

Both inputs are 360 by 240 pixels. No external paid API was called for this
probe. The model/provider identity describes this review session; it is not a
provider-signed unattended execution receipt.

## Observed comparison

The reference has a blue square toward the upper left of a pale gray panel.
The actual image has a red circle toward the upper right instead. The shape,
color and horizontal position changed. Both images retain a long black bar near
the bottom, with the same apparent size and position, and the same pale panel
and surrounding background. This observation comes from the actual image
inputs, not textual descriptions of their contents.

## Capability-only result and limits

This session demonstrated that this independent reviewer can inspect both
image inputs and identify substantial visual differences. This is a
capability-only result. It is **not** a product visual PASS, approved baseline,
design-conformance judgment, production-server capture, desktop/mobile state
coverage, owner acceptance, or proof that any unattended provider can receive
images or authenticate its review results. It does not satisfy the frontend
quality gate for any story or PR. Those claims require their own exact-revision,
source, screenshot, coverage, provider-provenance and acceptance evidence.
