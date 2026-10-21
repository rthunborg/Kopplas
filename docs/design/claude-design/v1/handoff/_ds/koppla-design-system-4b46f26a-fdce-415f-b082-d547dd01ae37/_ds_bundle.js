/* @ds-bundle: {"format":4,"namespace":"KopplaDesignSystem_4b46f2","components":[{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"Divider","sourcePath":"components/core/Divider.jsx"},{"name":"Icon","sourcePath":"components/core/Icon.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"Metric","sourcePath":"components/core/Metric.jsx"},{"name":"StatusDot","sourcePath":"components/core/StatusDot.jsx"},{"name":"Tag","sourcePath":"components/core/Tag.jsx"},{"name":"Toolbar","sourcePath":"components/core/Toolbar.jsx"},{"name":"EmptyState","sourcePath":"components/data/EmptyState.jsx"},{"name":"PhaseChain","sourcePath":"components/data/PhaseChain.jsx"},{"name":"ProgressBar","sourcePath":"components/data/ProgressBar.jsx"},{"name":"Table","sourcePath":"components/data/Table.jsx"},{"name":"Timeline","sourcePath":"components/data/Timeline.jsx"},{"name":"Banner","sourcePath":"components/feedback/Banner.jsx"},{"name":"Modal","sourcePath":"components/feedback/Modal.jsx"},{"name":"Toast","sourcePath":"components/feedback/Toast.jsx"},{"name":"Tooltip","sourcePath":"components/feedback/Tooltip.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Field","sourcePath":"components/forms/Field.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Radio","sourcePath":"components/forms/Radio.jsx"},{"name":"SegmentedControl","sourcePath":"components/forms/SegmentedControl.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"Textarea","sourcePath":"components/forms/Textarea.jsx"},{"name":"Breadcrumbs","sourcePath":"components/navigation/Breadcrumbs.jsx"},{"name":"SidebarNav","sourcePath":"components/navigation/SidebarNav.jsx"},{"name":"Tabs","sourcePath":"components/navigation/Tabs.jsx"},{"name":"TopBar","sourcePath":"components/navigation/TopBar.jsx"}],"sourceHashes":{"components/core/Badge.jsx":"0c87b780646f","components/core/Button.jsx":"b8d7a5dd7824","components/core/Card.jsx":"176216c0e6da","components/core/Divider.jsx":"59f86a27360d","components/core/Icon.jsx":"2ab47c105d9f","components/core/IconButton.jsx":"a68666233e16","components/core/Metric.jsx":"136bdfed86df","components/core/StatusDot.jsx":"c11ce841f6dc","components/core/Tag.jsx":"83be55a6017b","components/core/Toolbar.jsx":"edfc62fcc631","components/data/EmptyState.jsx":"878143793d8e","components/data/PhaseChain.jsx":"616f03e80afc","components/data/ProgressBar.jsx":"111e939d6d5a","components/data/Table.jsx":"68a17f126fec","components/data/Timeline.jsx":"cf008ce8d867","components/feedback/Banner.jsx":"3f03b6e4a037","components/feedback/Modal.jsx":"1b4272a24375","components/feedback/Toast.jsx":"feb4d2bf9d80","components/feedback/Tooltip.jsx":"8c76af309e62","components/forms/Checkbox.jsx":"c5c3ef650442","components/forms/Field.jsx":"23c1f1d64275","components/forms/Input.jsx":"c5345bc41851","components/forms/Radio.jsx":"296b47091fd0","components/forms/SegmentedControl.jsx":"bf5c3e179dd6","components/forms/Select.jsx":"96d8e5ba57dc","components/forms/Switch.jsx":"863d4a680e07","components/forms/Textarea.jsx":"c56677dbf330","components/navigation/Breadcrumbs.jsx":"efaee1357c19","components/navigation/SidebarNav.jsx":"7f9055ffd455","components/navigation/Tabs.jsx":"7b27384f626d","components/navigation/TopBar.jsx":"c492e23f37f7","ui_kits/app/Anbud.jsx":"f506b6d50e99","ui_kits/app/AppShell.jsx":"96e16ab38010","ui_kits/app/Fakturering.jsx":"b07b0f8a9be6","ui_kits/app/Installningar.jsx":"e71a6a77a0e5","ui_kits/app/Oversikt.jsx":"a1a6b73bb91a","ui_kits/app/ProjektDetalj.jsx":"78cef7d23d24","ui_kits/app/Tillgangar.jsx":"e59c85103ad0","ui_kits/app/data.js":"85127087a864","ui_kits/site/Chain.jsx":"59b90871b5f9","ui_kits/site/Footer.jsx":"551696857f87","ui_kits/site/Hero.jsx":"238c6246f1f7","ui_kits/site/Pricing.jsx":"0bdef99094fe","ui_kits/site/SiteHeader.jsx":"0025c2c7eb2a"},"inlinedExternals":[],"unexposedExports":[{"name":"iconNames","sourcePath":"components/core/Icon.jsx"}]} */

(() => {

const __ds_ns = (window.KopplaDesignSystem_4b46f2 = window.KopplaDesignSystem_4b46f2 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const badgeTones = {
  neutral: {
    background: 'var(--bg-sunken)',
    color: 'var(--text-secondary)'
  },
  ink: {
    background: 'var(--n-950)',
    color: 'var(--n-000)'
  },
  ok: {
    background: 'var(--ok-050)',
    color: 'var(--ok-700)'
  },
  warn: {
    background: 'var(--warn-050)',
    color: 'var(--warn-700)'
  },
  risk: {
    background: 'var(--risk-050)',
    color: 'var(--risk-700)'
  },
  info: {
    background: 'var(--info-050)',
    color: 'var(--info-700)'
  },
  signal: {
    background: 'var(--signal-200)',
    color: 'var(--signal-700)'
  }
};
function Badge({
  children,
  tone = 'neutral',
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--space-2)',
      fontSize: 'var(--size-3xs)',
      fontWeight: 'var(--weight-medium)',
      letterSpacing: 'var(--track-label)',
      padding: '3px var(--space-4)',
      borderRadius: 'var(--radius-xs)',
      whiteSpace: 'nowrap',
      ...badgeTones[tone],
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Card({
  children,
  title,
  action,
  padding = 'var(--space-8)',
  interactive = false,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("section", _extends({
    onMouseEnter: interactive ? () => setHover(true) : undefined,
    onMouseLeave: interactive ? () => setHover(false) : undefined,
    style: {
      background: 'var(--surface-card)',
      border: '1px solid ' + (interactive && hover ? 'var(--border-strong)' : 'var(--surface-card-border)'),
      borderRadius: 'var(--radius-card)',
      transition: 'var(--transition-control)',
      cursor: interactive ? 'pointer' : undefined,
      ...style
    }
  }, rest), title ? /*#__PURE__*/React.createElement("header", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 'var(--space-6)',
      padding: 'var(--space-6) ' + padding,
      borderBottom: '1px solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 'var(--size-sm)',
      fontWeight: 'var(--weight-medium)'
    }
  }, title), action) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      padding
    }
  }, children));
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/Divider.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Divider({
  vertical = false,
  label,
  style,
  ...rest
}) {
  if (label) {
    return /*#__PURE__*/React.createElement("div", _extends({
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-5)',
        ...style
      }
    }, rest), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 'var(--size-3xs)',
        letterSpacing: 'var(--track-caps)',
        textTransform: 'uppercase',
        color: 'var(--text-tertiary)'
      }
    }, label), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        height: 1,
        background: 'var(--border-default)'
      }
    }));
  }
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'block',
      flex: '0 0 auto',
      width: vertical ? 1 : '100%',
      height: vertical ? '100%' : 1,
      background: 'var(--border-default)',
      ...style
    }
  }, rest));
}
Object.assign(__ds_scope, { Divider });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Divider.jsx", error: String((e && e.message) || e) }); }

// components/core/Icon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Lucide 0.542.0 geometry, embedded so glyphs are real DOM (they survive
 * static capture, print and offline use). Inner markup only; 24x24 viewBox.
 */
const LUCIDE = {
  "layout-dashboard": "<rect width=\"7\" height=\"9\" x=\"3\" y=\"3\" rx=\"1\" /> <rect width=\"7\" height=\"5\" x=\"14\" y=\"3\" rx=\"1\" /> <rect width=\"7\" height=\"9\" x=\"14\" y=\"12\" rx=\"1\" /> <rect width=\"7\" height=\"5\" x=\"3\" y=\"16\" rx=\"1\" />",
  "file-text": "<path d=\"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z\" /> <path d=\"M14 2v4a2 2 0 0 0 2 2h4\" /> <path d=\"M10 9H8\" /> <path d=\"M16 13H8\" /> <path d=\"M16 17H8\" />",
  "folder-open": "<path d=\"m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2\" />",
  "clock": "<path d=\"M12 6v6l4 2\" /> <circle cx=\"12\" cy=\"12\" r=\"10\" />",
  "truck": "<path d=\"M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2\" /> <path d=\"M15 18H9\" /> <path d=\"M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14\" /> <circle cx=\"17\" cy=\"18\" r=\"2\" /> <circle cx=\"7\" cy=\"18\" r=\"2\" />",
  "chevron-right": "<path d=\"m9 18 6-6-6-6\" />",
  "receipt": "<path d=\"M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z\" /> <path d=\"M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8\" /> <path d=\"M12 17.5v-11\" />",
  "settings": "<path d=\"M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915\" /> <circle cx=\"12\" cy=\"12\" r=\"3\" />",
  "chevron-down": "<path d=\"m6 9 6 6 6-6\" />",
  "chevron-left": "<path d=\"m15 18-6-6 6-6\" />",
  "search": "<path d=\"m21 21-4.34-4.34\" /> <circle cx=\"11\" cy=\"11\" r=\"8\" />",
  "x": "<path d=\"M18 6 6 18\" /> <path d=\"m6 6 12 12\" />",
  "check": "<path d=\"M20 6 9 17l-5-5\" />",
  "minus": "<path d=\"M5 12h14\" />",
  "ellipsis": "<circle cx=\"12\" cy=\"12\" r=\"1\" /> <circle cx=\"19\" cy=\"12\" r=\"1\" /> <circle cx=\"5\" cy=\"12\" r=\"1\" />",
  "download": "<path d=\"M12 15V3\" /> <path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\" /> <path d=\"m7 10 5 5 5-5\" />",
  "upload": "<path d=\"M12 3v12\" /> <path d=\"m17 8-5-5-5 5\" /> <path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\" />",
  "plus": "<path d=\"M5 12h14\" /> <path d=\"M12 5v14\" />",
  "filter": "<path d=\"M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z\" />",
  "user": "<path d=\"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2\" /> <circle cx=\"12\" cy=\"7\" r=\"4\" />",
  "users": "<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\" /> <path d=\"M16 3.128a4 4 0 0 1 0 7.744\" /> <path d=\"M22 21v-2a4 4 0 0 0-3-3.87\" /> <circle cx=\"9\" cy=\"7\" r=\"4\" />",
  "arrow-left": "<path d=\"m12 19-7-7 7-7\" /> <path d=\"M19 12H5\" />",
  "arrow-right": "<path d=\"M5 12h14\" /> <path d=\"m12 5 7 7-7 7\" />",
  "file-plus": "<path d=\"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z\" /> <path d=\"M14 2v4a2 2 0 0 0 2 2h4\" /> <path d=\"M9 15h6\" /> <path d=\"M12 18v-6\" />",
  "calendar": "<path d=\"M8 2v4\" /> <path d=\"M16 2v4\" /> <rect width=\"18\" height=\"18\" x=\"3\" y=\"4\" rx=\"2\" /> <path d=\"M3 10h18\" />",
  "badge-check": "<path d=\"M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z\" /> <path d=\"m9 12 2 2 4-4\" />",
  "bell": "<path d=\"M10.268 21a2 2 0 0 0 3.464 0\" /> <path d=\"M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326\" />",
  "mail": "<path d=\"m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7\" /> <rect x=\"2\" y=\"4\" width=\"20\" height=\"16\" rx=\"2\" />",
  "inbox": "<polyline points=\"22 12 16 12 14 15 10 15 8 12 2 12\" /> <path d=\"M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z\" />",
  "info": "<circle cx=\"12\" cy=\"12\" r=\"10\" /> <path d=\"M12 16v-4\" /> <path d=\"M12 8h.01\" />",
  "circle-check": "<circle cx=\"12\" cy=\"12\" r=\"10\" /> <path d=\"m9 12 2 2 4-4\" />",
  "circle-alert": "<circle cx=\"12\" cy=\"12\" r=\"10\" /> <line x1=\"12\" x2=\"12\" y1=\"8\" y2=\"12\" /> <line x1=\"12\" x2=\"12.01\" y1=\"16\" y2=\"16\" />",
  "triangle-alert": "<path d=\"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3\" /> <path d=\"M12 9v4\" /> <path d=\"M12 17h.01\" />",
  "octagon-alert": "<path d=\"M12 16h.01\" /> <path d=\"M12 8v4\" /> <path d=\"M15.312 2a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586l-4.688-4.688A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2z\" />",
  "smartphone": "<rect width=\"14\" height=\"20\" x=\"5\" y=\"2\" rx=\"2\" ry=\"2\" /> <path d=\"M12 18h.01\" />",
  "plug": "<path d=\"M12 22v-5\" /> <path d=\"M9 8V2\" /> <path d=\"M15 8V2\" /> <path d=\"M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z\" />",
  "ruler": "<path d=\"M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z\" /> <path d=\"m14.5 12.5 2-2\" /> <path d=\"m11.5 9.5 2-2\" /> <path d=\"m8.5 6.5 2-2\" /> <path d=\"m17.5 15.5 2-2\" />",
  "hard-hat": "<path d=\"M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5\" /> <path d=\"M14 6a6 6 0 0 1 6 6v3\" /> <path d=\"M4 15v-3a6 6 0 0 1 6-6\" /> <rect x=\"2\" y=\"15\" width=\"20\" height=\"4\" rx=\"1\" />",
  "clipboard-check": "<rect width=\"8\" height=\"4\" x=\"8\" y=\"2\" rx=\"1\" ry=\"1\" /> <path d=\"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2\" /> <path d=\"m9 14 2 2 4-4\" />",
  "zap": "<path d=\"M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z\" />",
  "credit-card": "<rect width=\"20\" height=\"14\" x=\"2\" y=\"5\" rx=\"2\" /> <line x1=\"2\" x2=\"22\" y1=\"10\" y2=\"10\" />",
  "trash-2": "<path d=\"M10 11v6\" /> <path d=\"M14 11v6\" /> <path d=\"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6\" /> <path d=\"M3 6h18\" /> <path d=\"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2\" />",
  "pencil": "<path d=\"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z\" /> <path d=\"m15 5 4 4\" />",
  "eye": "<path d=\"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0\" /> <circle cx=\"12\" cy=\"12\" r=\"3\" />",
  "camera": "<path d=\"M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z\" /> <circle cx=\"12\" cy=\"13\" r=\"3\" />",
  "map-pin": "<path d=\"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0\" /> <circle cx=\"12\" cy=\"10\" r=\"3\" />",
  "phone": "<path d=\"M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384\" />",
  "building-2": "<path d=\"M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z\" /> <path d=\"M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2\" /> <path d=\"M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2\" /> <path d=\"M10 6h4\" /> <path d=\"M10 10h4\" /> <path d=\"M10 14h4\" /> <path d=\"M10 18h4\" />",
  "wrench": "<path d=\"M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z\" />",
  "list-checks": "<path d=\"m3 17 2 2 4-4\" /> <path d=\"m3 7 2 2 4-4\" /> <path d=\"M13 6h8\" /> <path d=\"M13 12h8\" /> <path d=\"M13 18h8\" />",
  "external-link": "<path d=\"M15 3h6v6\" /> <path d=\"M10 14 21 3\" /> <path d=\"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6\" />",
  "lock": "<rect width=\"18\" height=\"11\" x=\"3\" y=\"11\" rx=\"2\" ry=\"2\" /> <path d=\"M7 11V7a5 5 0 0 1 10 0v4\" />",
  "log-out": "<path d=\"m16 17 5-5-5-5\" /> <path d=\"M21 12H9\" /> <path d=\"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4\" />",
  "refresh-cw": "<path d=\"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8\" /> <path d=\"M21 3v5h-5\" /> <path d=\"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16\" /> <path d=\"M8 16H3v5\" />",
  "paperclip": "<path d=\"m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551\" />",
  "printer": "<path d=\"M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2\" /> <path d=\"M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6\" /> <rect x=\"6\" y=\"14\" width=\"12\" height=\"8\" rx=\"1\" />",
  "copy": "<rect width=\"14\" height=\"14\" x=\"8\" y=\"8\" rx=\"2\" ry=\"2\" /> <path d=\"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2\" />"
};
function Icon({
  name,
  size = 16,
  strokeWidth = 1.75,
  style,
  title,
  ...rest
}) {
  const d = LUCIDE[name];
  if (!d) {
    if (typeof console !== 'undefined') console.warn('Icon: unknown name "' + name + '"');
    return null;
  }
  return /*#__PURE__*/React.createElement("svg", _extends({
    viewBox: "0 0 24 24",
    width: size,
    height: size,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    role: title ? 'img' : undefined,
    "aria-label": title,
    "aria-hidden": title ? undefined : true,
    focusable: "false",
    style: {
      display: 'inline-block',
      flex: '0 0 auto',
      ...style
    },
    dangerouslySetInnerHTML: {
      __html: (title ? '<title>' + title + '</title>' : '') + d
    }
  }, rest));
}
const iconNames = Object.keys(LUCIDE);
Object.assign(__ds_scope, { Icon, iconNames });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Icon.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const btnBase = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 'var(--space-3)',
  fontFamily: 'var(--font-core)',
  fontWeight: 'var(--weight-medium)',
  letterSpacing: 'var(--track-label)',
  borderRadius: 'var(--radius-control)',
  border: '1px solid transparent',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  textDecoration: 'none',
  transition: 'var(--transition-control)'
};
const btnSizes = {
  sm: {
    height: 'var(--control-h-sm)',
    padding: '0 var(--space-5)',
    fontSize: 'var(--size-2xs)'
  },
  md: {
    height: 'var(--control-h-md)',
    padding: '0 var(--space-6)',
    fontSize: 'var(--size-xs)'
  },
  lg: {
    height: 'var(--control-h-lg)',
    padding: '0 var(--space-7)',
    fontSize: 'var(--size-md)'
  }
};
const btnVariants = {
  primary: {
    background: 'var(--action-primary-bg)',
    color: 'var(--action-primary-fg)'
  },
  secondary: {
    background: 'var(--action-secondary-bg)',
    color: 'var(--action-secondary-fg)',
    borderColor: 'var(--border-strong)'
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-primary)'
  },
  signal: {
    background: 'var(--action-signal-bg)',
    color: 'var(--action-signal-fg)'
  },
  danger: {
    background: 'transparent',
    color: 'var(--action-risk-fg)',
    borderColor: 'var(--border-default)'
  }
};
const btnHover = {
  primary: {
    background: 'var(--action-primary-bg-hover)'
  },
  secondary: {
    background: 'var(--bg-hover)'
  },
  ghost: {
    background: 'var(--bg-hover)'
  },
  signal: {
    background: 'var(--action-signal-bg-hover)'
  },
  danger: {
    background: 'var(--risk-050)'
  }
};
function Button({
  children,
  variant = 'secondary',
  size = 'md',
  icon,
  iconAfter,
  disabled = false,
  loading = false,
  fullWidth = false,
  as = 'button',
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const Tag = as;
  const iconSize = size === 'lg' ? 18 : 16;
  return /*#__PURE__*/React.createElement(Tag, _extends({
    disabled: Tag === 'button' ? disabled || loading : undefined,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      ...btnBase,
      ...btnSizes[size],
      ...btnVariants[variant],
      ...(hover && !disabled && !loading ? btnHover[variant] : null),
      ...(fullWidth ? {
        width: '100%'
      } : null),
      ...(disabled ? {
        background: 'var(--bg-inset)',
        color: 'var(--text-disabled)',
        borderColor: 'var(--border-subtle)',
        cursor: 'not-allowed'
      } : null),
      ...(loading ? {
        opacity: 0.6,
        cursor: 'progress'
      } : null),
      ...style
    }
  }, rest), icon ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: iconSize
  }) : null, children, iconAfter ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: iconAfter,
    size: iconSize
  }) : null);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const ibSizes = {
  sm: 28,
  md: 34,
  lg: 44
};
function IconButton({
  icon,
  label,
  size = 'md',
  variant = 'ghost',
  active = false,
  disabled = false,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const box = ibSizes[size];
  return /*#__PURE__*/React.createElement("button", _extends({
    "aria-label": label,
    title: label,
    disabled: disabled,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      width: box,
      height: box,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 'var(--radius-control)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      border: variant === 'outline' ? '1px solid var(--border-strong)' : '1px solid transparent',
      background: active ? 'var(--bg-active)' : hover && !disabled ? 'var(--bg-hover)' : 'transparent',
      color: disabled ? 'var(--text-disabled)' : active ? 'var(--text-primary)' : 'var(--text-secondary)',
      transition: 'var(--transition-control)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: size === 'lg' ? 20 : 16
  }));
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/core/Metric.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Metric({
  label,
  value,
  unit,
  delta,
  deltaTone = 'neutral',
  size = 'md',
  style,
  ...rest
}) {
  const sizes = {
    sm: 'var(--size-2xl)',
    md: 'var(--size-3xl)',
    lg: 'var(--size-4xl)'
  };
  const tones = {
    up: 'var(--text-ok)',
    down: 'var(--text-risk)',
    neutral: 'var(--text-secondary)'
  };
  return /*#__PURE__*/React.createElement("div", _extends({
    style: style
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--size-3xs)',
      letterSpacing: 'var(--track-caps)',
      textTransform: 'uppercase',
      color: 'var(--text-tertiary)'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 'var(--space-4)',
      marginTop: 'var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: sizes[size],
      fontWeight: 'var(--weight-semibold)',
      letterSpacing: '-0.025em',
      fontVariantNumeric: 'tabular-nums'
    }
  }, value), unit ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--size-sm)',
      color: 'var(--text-secondary)'
    }
  }, unit) : null, delta ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--size-2xs)',
      color: tones[deltaTone],
      fontVariantNumeric: 'tabular-nums'
    }
  }, delta) : null));
}
Object.assign(__ds_scope, { Metric });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Metric.jsx", error: String((e && e.message) || e) }); }

// components/core/StatusDot.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const dotColors = {
  draft: 'var(--n-400)',
  planned: 'var(--info-500)',
  active: 'var(--signal-500)',
  waiting: 'var(--warn-500)',
  done: 'var(--ok-500)',
  deviation: 'var(--risk-500)'
};
function StatusDot({
  status = 'draft',
  label,
  size = 6,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--space-3)',
      fontSize: 'var(--size-sm)',
      color: 'var(--text-primary)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      width: size,
      height: size,
      borderRadius: 'var(--radius-pill)',
      background: dotColors[status],
      flex: '0 0 auto'
    }
  }), label);
}
Object.assign(__ds_scope, { StatusDot });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/StatusDot.jsx", error: String((e && e.message) || e) }); }

// components/core/Tag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Tag({
  children,
  onRemove,
  icon,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--space-3)',
      fontSize: 'var(--size-2xs)',
      color: 'var(--text-primary)',
      padding: '4px var(--space-4)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-xs)',
      background: 'var(--bg-page)',
      ...style
    }
  }, rest), icon ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 12,
    style: {
      color: 'var(--text-tertiary)'
    }
  }) : null, children, onRemove ? /*#__PURE__*/React.createElement("button", {
    onClick: onRemove,
    "aria-label": "Ta bort",
    style: {
      display: 'inline-flex',
      border: 0,
      background: 'none',
      padding: 0,
      cursor: 'pointer',
      color: 'var(--text-tertiary)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "x",
    size: 12
  })) : null);
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Tag.jsx", error: String((e && e.message) || e) }); }

// components/core/Toolbar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Toolbar({
  children,
  right,
  dense = false,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-4)',
      minHeight: dense ? 'var(--control-h-sm)' : 'var(--control-h-md)',
      ...style
    }
  }, rest), children, right ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: 'auto',
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-4)'
    }
  }, right) : null);
}
Object.assign(__ds_scope, { Toolbar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Toolbar.jsx", error: String((e && e.message) || e) }); }

// components/data/EmptyState.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function EmptyState({
  icon = 'inbox',
  title,
  description,
  action,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'grid',
      justifyItems: 'center',
      textAlign: 'center',
      padding: 'var(--space-12) var(--space-8)',
      gap: 'var(--space-4)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 28,
    style: {
      color: 'var(--text-tertiary)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--size-lg)',
      fontWeight: 'var(--weight-medium)',
      letterSpacing: 'var(--track-heading)',
      marginTop: 'var(--space-3)'
    }
  }, title), description ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--size-xs)',
      color: 'var(--text-secondary)',
      maxWidth: 320
    }
  }, description) : null, action ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--space-5)'
    }
  }, action) : null);
}
Object.assign(__ds_scope, { EmptyState });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/EmptyState.jsx", error: String((e && e.message) || e) }); }

// components/data/PhaseChain.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const defaultPhases = [{
  key: 'prospekt',
  label: 'Prospektering'
}, {
  key: 'projektering',
  label: 'Projektering'
}, {
  key: 'genomforande',
  label: 'Genomförande'
}, {
  key: 'dokumentation',
  label: 'Dokumentering'
}, {
  key: 'fakturering',
  label: 'Fakturering'
}];
function PhaseChain({
  phases = defaultPhases,
  current = 0,
  onSelect,
  compact = false,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("ol", _extends({
    style: {
      display: 'flex',
      alignItems: 'stretch',
      listStyle: 'none',
      margin: 0,
      padding: 0,
      gap: 0,
      ...style
    }
  }, rest), phases.map((p, i) => {
    const done = i < current;
    const active = i === current;
    return /*#__PURE__*/React.createElement("li", {
      key: p.key || i,
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: onSelect ? () => onSelect(i, p) : undefined,
      style: {
        width: '100%',
        textAlign: 'left',
        border: 0,
        background: 'transparent',
        cursor: onSelect ? 'pointer' : 'default',
        padding: 0
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        height: 3,
        background: active ? 'var(--signal-400)' : done ? 'var(--n-950)' : 'var(--n-150)'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        padding: compact ? 'var(--space-4) var(--space-4) 0 0' : 'var(--space-5) var(--space-6) 0 0'
      }
    }, done ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: "check",
      size: 13,
      style: {
        color: 'var(--text-primary)'
      }
    }) : null, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: compact ? 'var(--size-2xs)' : 'var(--size-xs)',
        fontWeight: active ? 'var(--weight-medium)' : 'var(--weight-regular)',
        color: active || done ? 'var(--text-primary)' : 'var(--text-tertiary)',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }
    }, p.label)), p.meta && !compact ? /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        fontSize: 'var(--size-2xs)',
        color: 'var(--text-tertiary)',
        marginTop: 2
      }
    }, p.meta) : null));
  }));
}
Object.assign(__ds_scope, { PhaseChain });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/PhaseChain.jsx", error: String((e && e.message) || e) }); }

// components/data/ProgressBar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ProgressBar({
  value = 0,
  label,
  valueLabel,
  tone = 'ink',
  height = 4,
  style,
  ...rest
}) {
  const tones = {
    ink: 'var(--n-950)',
    signal: 'var(--signal-400)',
    ok: 'var(--ok-500)',
    risk: 'var(--risk-500)'
  };
  return /*#__PURE__*/React.createElement("div", _extends({
    style: style
  }, rest), label || valueLabel ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: 'var(--space-5)',
      marginBottom: 'var(--space-3)',
      fontSize: 'var(--size-2xs)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-secondary)'
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-primary)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, valueLabel)) : null, /*#__PURE__*/React.createElement("div", {
    role: "progressbar",
    "aria-valuenow": value,
    style: {
      height,
      background: 'var(--n-150)',
      borderRadius: 'var(--radius-pill)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: Math.max(0, Math.min(100, value)) + '%',
      height: '100%',
      background: tones[tone],
      transition: 'width var(--dur-base) var(--ease-standard)'
    }
  })));
}
Object.assign(__ds_scope, { ProgressBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/ProgressBar.jsx", error: String((e && e.message) || e) }); }

// components/data/Table.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Table({
  columns = [],
  rows = [],
  onRowClick,
  selectedId,
  dense = false,
  style,
  ...rest
}) {
  const [hoverId, setHoverId] = React.useState(null);
  const pad = dense ? 'var(--space-4) var(--space-5)' : 'var(--space-5) var(--space-6)';
  return /*#__PURE__*/React.createElement("table", _extends({
    style: {
      width: '100%',
      borderCollapse: 'collapse',
      fontVariantNumeric: 'tabular-nums',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, columns.map(c => /*#__PURE__*/React.createElement("th", {
    key: c.key,
    style: {
      textAlign: c.align || 'left',
      padding: pad,
      fontSize: 'var(--size-3xs)',
      letterSpacing: 'var(--track-caps)',
      textTransform: 'uppercase',
      fontWeight: 'var(--weight-medium)',
      color: 'var(--text-tertiary)',
      borderBottom: '1px solid var(--border-default)',
      whiteSpace: 'nowrap',
      width: c.width
    }
  }, c.header)))), /*#__PURE__*/React.createElement("tbody", null, rows.map((r, i) => {
    const id = r.id != null ? r.id : i;
    const selected = selectedId != null && selectedId === id;
    return /*#__PURE__*/React.createElement("tr", {
      key: id,
      onClick: onRowClick ? () => onRowClick(r) : undefined,
      onMouseEnter: () => setHoverId(id),
      onMouseLeave: () => setHoverId(null),
      style: {
        cursor: onRowClick ? 'pointer' : undefined,
        background: selected ? 'var(--bg-selected)' : hoverId === id ? 'var(--bg-hover)' : 'transparent',
        transition: 'background-color var(--dur-fast) var(--ease-standard)'
      }
    }, columns.map((c, ci) => /*#__PURE__*/React.createElement("td", {
      key: c.key,
      style: {
        padding: pad,
        textAlign: c.align || 'left',
        fontSize: 'var(--size-xs)',
        color: ci === 0 ? 'var(--text-primary)' : 'var(--text-secondary)',
        fontWeight: ci === 0 && selected ? 'var(--weight-medium)' : 'var(--weight-regular)',
        borderBottom: '1px solid var(--border-subtle)',
        whiteSpace: c.wrap ? 'normal' : 'nowrap'
      }
    }, c.render ? c.render(r) : r[c.key])));
  })));
}
Object.assign(__ds_scope, { Table });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Table.jsx", error: String((e && e.message) || e) }); }

// components/data/Timeline.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Timeline({
  items = [],
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("ol", _extends({
    style: {
      listStyle: 'none',
      margin: 0,
      padding: 0,
      ...style
    }
  }, rest), items.map((it, i) => /*#__PURE__*/React.createElement("li", {
    key: i,
    style: {
      display: 'grid',
      gridTemplateColumns: '92px 16px 1fr',
      gap: 'var(--space-5)',
      paddingBottom: i === items.length - 1 ? 0 : 'var(--space-7)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--size-2xs)',
      color: 'var(--text-tertiary)',
      fontVariantNumeric: 'tabular-nums',
      paddingTop: 2
    }
  }, it.time), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'relative',
      display: 'flex',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 7,
      height: 7,
      borderRadius: 'var(--radius-pill)',
      background: it.tone === 'active' ? 'var(--signal-500)' : 'var(--n-300)',
      marginTop: 6
    }
  }), i === items.length - 1 ? null : /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 17,
      bottom: -22,
      width: 1,
      background: 'var(--border-default)'
    }
  })), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 'var(--size-xs)',
      color: 'var(--text-primary)'
    }
  }, it.title), it.meta ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 'var(--size-2xs)',
      color: 'var(--text-tertiary)',
      marginTop: 2
    }
  }, it.meta) : null))));
}
Object.assign(__ds_scope, { Timeline });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Timeline.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Banner.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const bannerTones = {
  neutral: {
    bg: 'var(--bg-sunken)',
    fg: 'var(--text-primary)',
    icon: 'info',
    border: 'var(--border-default)'
  },
  ok: {
    bg: 'var(--ok-050)',
    fg: 'var(--ok-700)',
    icon: 'circle-check',
    border: 'var(--ok-050)'
  },
  warn: {
    bg: 'var(--warn-050)',
    fg: 'var(--warn-700)',
    icon: 'triangle-alert',
    border: 'var(--warn-050)'
  },
  risk: {
    bg: 'var(--risk-050)',
    fg: 'var(--risk-700)',
    icon: 'octagon-alert',
    border: 'var(--risk-050)'
  },
  info: {
    bg: 'var(--info-050)',
    fg: 'var(--info-700)',
    icon: 'info',
    border: 'var(--info-050)'
  }
};
function Banner({
  tone = 'neutral',
  title,
  children,
  action,
  onDismiss,
  style,
  ...rest
}) {
  const t = bannerTones[tone];
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "status",
    style: {
      display: 'flex',
      gap: 'var(--space-5)',
      alignItems: 'flex-start',
      padding: 'var(--space-5) var(--space-6)',
      background: t.bg,
      border: '1px solid ' + t.border,
      borderRadius: 'var(--radius-card)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: t.icon,
    size: 16,
    style: {
      color: t.fg,
      marginTop: 1
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, title ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--size-xs)',
      fontWeight: 'var(--weight-medium)',
      color: t.fg
    }
  }, title) : null, children ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--size-xs)',
      color: 'var(--text-secondary)',
      marginTop: title ? 2 : 0
    }
  }, children) : null), action, onDismiss ? /*#__PURE__*/React.createElement("button", {
    onClick: onDismiss,
    "aria-label": "St\xE4ng",
    style: {
      border: 0,
      background: 'none',
      cursor: 'pointer',
      color: 'var(--text-tertiary)',
      padding: 0,
      display: 'inline-flex'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "x",
    size: 14
  })) : null);
}
Object.assign(__ds_scope, { Banner });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Banner.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Modal.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Modal({
  open = true,
  title,
  description,
  children,
  footer,
  onClose,
  width = 520,
  style,
  ...rest
}) {
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      display: 'grid',
      placeItems: 'center',
      padding: 'var(--space-8)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: 'absolute',
      inset: 0,
      background: 'var(--bg-scrim)'
    }
  }), /*#__PURE__*/React.createElement("div", _extends({
    role: "dialog",
    "aria-modal": "true",
    style: {
      position: 'relative',
      width: '100%',
      maxWidth: width,
      background: 'var(--surface-card)',
      borderRadius: 'var(--radius-sheet)',
      boxShadow: 'var(--shadow-lg)',
      overflow: 'hidden',
      animation: 'none',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("header", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 'var(--space-6)',
      padding: 'var(--space-8) var(--space-8) var(--space-6)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 'var(--size-lg)',
      fontWeight: 'var(--weight-medium)',
      letterSpacing: 'var(--track-heading)'
    }
  }, title), description ? /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--size-xs)',
      color: 'var(--text-secondary)',
      marginTop: 'var(--space-3)'
    }
  }, description) : null), onClose ? /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    "aria-label": "St\xE4ng",
    style: {
      border: 0,
      background: 'none',
      cursor: 'pointer',
      color: 'var(--text-tertiary)',
      padding: 0,
      display: 'inline-flex'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "x",
    size: 16
  })) : null), children ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 var(--space-8) var(--space-8)'
    }
  }, children) : null, footer ? /*#__PURE__*/React.createElement("footer", {
    style: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 'var(--space-4)',
      padding: 'var(--space-6) var(--space-8)',
      borderTop: '1px solid var(--border-subtle)',
      background: 'var(--bg-inset)'
    }
  }, footer) : null));
}
Object.assign(__ds_scope, { Modal });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Modal.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Toast.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Toast({
  message,
  tone = 'neutral',
  action,
  onDismiss,
  style,
  ...rest
}) {
  const icons = {
    neutral: null,
    ok: 'circle-check',
    risk: 'octagon-alert'
  };
  const icon = icons[tone];
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "status",
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--space-5)',
      padding: 'var(--space-5) var(--space-6)',
      background: 'var(--n-950)',
      color: 'var(--n-000)',
      borderRadius: 'var(--radius-card)',
      boxShadow: 'var(--shadow-lg)',
      fontSize: 'var(--size-xs)',
      ...style
    }
  }, rest), icon ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 15,
    style: {
      color: tone === 'ok' ? 'var(--signal-400)' : 'var(--n-000)'
    }
  }) : null, /*#__PURE__*/React.createElement("span", null, message), action ? /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'var(--space-3)'
    }
  }, action) : null, onDismiss ? /*#__PURE__*/React.createElement("button", {
    onClick: onDismiss,
    "aria-label": "St\xE4ng",
    style: {
      border: 0,
      background: 'none',
      cursor: 'pointer',
      color: 'var(--n-400)',
      padding: 0,
      display: 'inline-flex'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "x",
    size: 14
  })) : null);
}
Object.assign(__ds_scope, { Toast });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Toast.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Tooltip.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Tooltip({
  label,
  children,
  placement = 'top',
  style,
  ...rest
}) {
  const [open, setOpen] = React.useState(false);
  const pos = placement === 'bottom' ? {
    top: '100%',
    marginTop: 6
  } : {
    bottom: '100%',
    marginBottom: 6
  };
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      position: 'relative',
      display: 'inline-flex'
    },
    onMouseEnter: () => setOpen(true),
    onMouseLeave: () => setOpen(false),
    onFocus: () => setOpen(true),
    onBlur: () => setOpen(false)
  }, rest), children, /*#__PURE__*/React.createElement("span", {
    role: "tooltip",
    style: {
      position: 'absolute',
      left: '50%',
      transform: 'translateX(-50%)',
      ...pos,
      padding: '5px var(--space-5)',
      background: 'var(--n-950)',
      color: 'var(--n-000)',
      fontSize: 'var(--size-3xs)',
      whiteSpace: 'nowrap',
      borderRadius: 'var(--radius-xs)',
      pointerEvents: 'none',
      opacity: open ? 1 : 0,
      transition: 'opacity var(--dur-fast) var(--ease-standard)',
      zIndex: 50,
      ...style
    }
  }, label));
}
Object.assign(__ds_scope, { Tooltip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Tooltip.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Checkbox({
  label,
  checked,
  indeterminate = false,
  disabled = false,
  onChange,
  style,
  ...rest
}) {
  const on = checked || indeterminate;
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--space-4)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontSize: 'var(--size-xs)',
      color: disabled ? 'var(--text-disabled)' : 'var(--text-primary)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("input", _extends({
    type: "checkbox",
    checked: !!checked,
    disabled: disabled,
    onChange: onChange,
    style: {
      position: 'absolute',
      opacity: 0,
      width: 1,
      height: 1
    }
  }, rest)), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 16,
      height: 16,
      flex: '0 0 auto',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 'var(--radius-xs)',
      transition: 'var(--transition-control)',
      background: disabled ? 'var(--bg-inset)' : on ? 'var(--n-950)' : 'var(--bg-page)',
      border: '1px solid ' + (disabled ? 'var(--border-default)' : on ? 'var(--n-950)' : 'var(--border-strong)'),
      color: 'var(--n-000)'
    }
  }, indeterminate ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "minus",
    size: 12
  }) : checked ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "check",
    size: 12
  }) : null), label);
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Field.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Field({
  label,
  hint,
  error,
  required = false,
  htmlFor,
  children,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'grid',
      gap: 'var(--space-3)',
      ...style
    }
  }, rest), label ? /*#__PURE__*/React.createElement("label", {
    htmlFor: htmlFor,
    style: {
      fontSize: 'var(--size-xs)',
      fontWeight: 'var(--weight-medium)',
      letterSpacing: 'var(--track-label)',
      color: 'var(--text-primary)'
    }
  }, label, required ? /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-tertiary)'
    }
  }, " (obligatorisk)") : null) : null, children, error ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--size-2xs)',
      color: 'var(--text-risk)'
    }
  }, error) : hint ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--size-2xs)',
      color: 'var(--text-tertiary)'
    }
  }, hint) : null);
}
Object.assign(__ds_scope, { Field });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Field.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Input({
  icon,
  suffix,
  invalid = false,
  size = 'md',
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const h = size === 'lg' ? 'var(--control-h-lg)' : size === 'sm' ? 'var(--control-h-sm)' : 'var(--control-h-md)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-4)',
      height: h,
      padding: '0 var(--space-5)',
      background: rest.disabled ? 'var(--bg-inset)' : 'var(--bg-page)',
      border: '1px solid ' + (invalid ? 'var(--risk-500)' : focus ? 'var(--border-focus)' : 'var(--border-default)'),
      boxShadow: focus ? '0 0 0 1px var(--border-focus)' : 'none',
      borderRadius: 'var(--radius-control)',
      transition: 'var(--transition-control)',
      ...style
    }
  }, icon ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 14,
    style: {
      color: 'var(--text-tertiary)'
    }
  }) : null, /*#__PURE__*/React.createElement("input", _extends({
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      flex: 1,
      minWidth: 0,
      border: 0,
      outline: 'none',
      background: 'transparent',
      fontFamily: 'var(--font-core)',
      fontSize: size === 'lg' ? 'var(--size-md)' : 'var(--size-xs)',
      color: rest.disabled ? 'var(--text-disabled)' : 'var(--text-primary)',
      letterSpacing: 'var(--track-body)'
    }
  }, rest)), suffix ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--size-2xs)',
      color: 'var(--text-tertiary)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, suffix) : null);
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Radio.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Radio({
  label,
  checked,
  disabled = false,
  description,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'inline-flex',
      alignItems: description ? 'flex-start' : 'center',
      gap: 'var(--space-4)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontSize: 'var(--size-xs)',
      color: disabled ? 'var(--text-disabled)' : 'var(--text-primary)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("input", _extends({
    type: "radio",
    checked: !!checked,
    disabled: disabled,
    style: {
      position: 'absolute',
      opacity: 0,
      width: 1,
      height: 1
    }
  }, rest)), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 16,
      height: 16,
      flex: '0 0 auto',
      marginTop: description ? 2 : 0,
      borderRadius: 'var(--radius-pill)',
      border: '1px solid ' + (checked ? 'var(--n-950)' : 'var(--border-strong)'),
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'var(--transition-control)',
      background: 'var(--bg-page)'
    }
  }, checked ? /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: 'var(--radius-pill)',
      background: 'var(--n-950)'
    }
  }) : null), /*#__PURE__*/React.createElement("span", null, label, description ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 'var(--size-2xs)',
      color: 'var(--text-tertiary)',
      marginTop: 2
    }
  }, description) : null));
}
Object.assign(__ds_scope, { Radio });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Radio.jsx", error: String((e && e.message) || e) }); }

// components/forms/SegmentedControl.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function SegmentedControl({
  options = [],
  value,
  onChange,
  size = 'md',
  style,
  ...rest
}) {
  const h = size === 'sm' ? 'var(--control-h-sm)' : size === 'lg' ? 'var(--control-h-lg)' : 'var(--control-h-md)';
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "tablist",
    style: {
      display: 'inline-flex',
      height: h,
      padding: 2,
      gap: 2,
      background: 'var(--bg-sunken)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-control)',
      ...style
    }
  }, rest), options.map(o => {
    const val = typeof o === 'string' ? o : o.value;
    const label = typeof o === 'string' ? o : o.label;
    const on = val === value;
    return /*#__PURE__*/React.createElement("button", {
      key: val,
      role: "tab",
      "aria-selected": on,
      onClick: () => onChange && onChange(val),
      style: {
        border: 0,
        cursor: 'pointer',
        padding: '0 var(--space-5)',
        borderRadius: 3,
        fontFamily: 'var(--font-core)',
        fontSize: size === 'lg' ? 'var(--size-sm)' : 'var(--size-2xs)',
        fontWeight: on ? 'var(--weight-medium)' : 'var(--weight-regular)',
        background: on ? 'var(--bg-page)' : 'transparent',
        color: on ? 'var(--text-primary)' : 'var(--text-secondary)',
        boxShadow: on ? 'var(--shadow-sm)' : 'none',
        transition: 'var(--transition-control)'
      }
    }, label);
  }));
}
Object.assign(__ds_scope, { SegmentedControl });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/SegmentedControl.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Select({
  options = [],
  placeholder,
  invalid = false,
  size = 'md',
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const h = size === 'lg' ? 'var(--control-h-lg)' : size === 'sm' ? 'var(--control-h-sm)' : 'var(--control-h-md)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      height: h,
      background: rest.disabled ? 'var(--bg-inset)' : 'var(--bg-page)',
      border: '1px solid ' + (invalid ? 'var(--risk-500)' : focus ? 'var(--border-focus)' : 'var(--border-default)'),
      boxShadow: focus ? '0 0 0 1px var(--border-focus)' : 'none',
      borderRadius: 'var(--radius-control)',
      transition: 'var(--transition-control)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("select", _extends({
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      appearance: 'none',
      WebkitAppearance: 'none',
      flex: 1,
      minWidth: 0,
      height: '100%',
      border: 0,
      outline: 'none',
      background: 'transparent',
      cursor: 'pointer',
      padding: '0 var(--space-9) 0 var(--space-5)',
      fontFamily: 'var(--font-core)',
      fontSize: size === 'lg' ? 'var(--size-md)' : 'var(--size-xs)',
      color: rest.disabled ? 'var(--text-disabled)' : 'var(--text-primary)'
    }
  }, rest), placeholder ? /*#__PURE__*/React.createElement("option", {
    value: ""
  }, placeholder) : null, options.map(o => {
    const value = typeof o === 'string' ? o : o.value;
    const label = typeof o === 'string' ? o : o.label;
    return /*#__PURE__*/React.createElement("option", {
      key: value,
      value: value
    }, label);
  })), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevron-down",
    size: 14,
    style: {
      position: 'absolute',
      right: 10,
      color: 'var(--text-tertiary)',
      pointerEvents: 'none'
    }
  }));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Switch({
  checked = false,
  onChange,
  label,
  disabled = false,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--space-5)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontSize: 'var(--size-xs)',
      color: disabled ? 'var(--text-disabled)' : 'var(--text-primary)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("input", _extends({
    type: "checkbox",
    role: "switch",
    checked: checked,
    disabled: disabled,
    onChange: onChange,
    style: {
      position: 'absolute',
      opacity: 0,
      width: 1,
      height: 1
    }
  }, rest)), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 34,
      height: 20,
      flex: '0 0 auto',
      borderRadius: 'var(--radius-pill)',
      padding: 2,
      background: disabled ? 'var(--n-200)' : checked ? 'var(--n-950)' : 'var(--n-200)',
      transition: 'background-color var(--dur-fast) var(--ease-standard)',
      display: 'flex',
      justifyContent: checked ? 'flex-end' : 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 16,
      height: 16,
      borderRadius: 'var(--radius-pill)',
      background: 'var(--n-000)',
      boxShadow: 'var(--shadow-sm)',
      transition: 'transform var(--dur-fast) var(--ease-standard)'
    }
  })), label);
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/forms/Textarea.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Textarea({
  rows = 4,
  invalid = false,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  return /*#__PURE__*/React.createElement("textarea", _extends({
    rows: rows,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      width: '100%',
      padding: 'var(--space-5)',
      resize: 'vertical',
      fontFamily: 'var(--font-core)',
      fontSize: 'var(--size-xs)',
      lineHeight: 'var(--lh-normal)',
      color: 'var(--text-primary)',
      background: 'var(--bg-page)',
      border: '1px solid ' + (invalid ? 'var(--risk-500)' : focus ? 'var(--border-focus)' : 'var(--border-default)'),
      boxShadow: focus ? '0 0 0 1px var(--border-focus)' : 'none',
      borderRadius: 'var(--radius-control)',
      outline: 'none',
      transition: 'var(--transition-control)',
      ...style
    }
  }, rest));
}
Object.assign(__ds_scope, { Textarea });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Textarea.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Breadcrumbs.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Breadcrumbs({
  items = [],
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("nav", _extends({
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-4)',
      fontSize: 'var(--size-2xs)',
      color: 'var(--text-tertiary)',
      ...style
    }
  }, rest), items.map((it, i) => {
    const label = typeof it === 'string' ? it : it.label;
    const last = i === items.length - 1;
    return /*#__PURE__*/React.createElement(React.Fragment, {
      key: i
    }, last ? /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--text-primary)'
      }
    }, label) : /*#__PURE__*/React.createElement("a", {
      href: typeof it === 'object' && it.href || '#',
      style: {
        color: 'var(--text-secondary)',
        textDecoration: 'none',
        borderBottom: 0
      }
    }, label), last ? null : /*#__PURE__*/React.createElement("span", {
      "aria-hidden": true,
      style: {
        color: 'var(--text-tertiary)'
      }
    }, "/"));
  }));
}
Object.assign(__ds_scope, { Breadcrumbs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Breadcrumbs.jsx", error: String((e && e.message) || e) }); }

// components/navigation/SidebarNav.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function SidebarNav({
  items = [],
  value,
  onSelect,
  brand = 'Kopplas',
  footer,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(null);
  return /*#__PURE__*/React.createElement("nav", _extends({
    style: {
      width: 'var(--sidebar-w)',
      flex: '0 0 auto',
      height: '100%',
      boxSizing: 'border-box',
      background: 'var(--bg-sunken)',
      borderRight: '1px solid var(--border-default)',
      display: 'flex',
      flexDirection: 'column',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 'var(--topbar-h)',
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-4)',
      padding: '0 var(--space-6)',
      flex: '0 0 auto'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      background: 'var(--signal-400)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--size-lg)',
      fontWeight: 'var(--weight-medium)',
      letterSpacing: '-0.03em'
    }
  }, brand)), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 'var(--space-4)',
      display: 'grid',
      gap: 1,
      overflowY: 'auto'
    }
  }, items.map(it => {
    if (it.section) {
      return /*#__PURE__*/React.createElement("div", {
        key: it.section,
        style: {
          fontSize: 'var(--size-3xs)',
          letterSpacing: 'var(--track-caps)',
          textTransform: 'uppercase',
          color: 'var(--text-tertiary)',
          padding: 'var(--space-6) var(--space-5) var(--space-3)'
        }
      }, it.section);
    }
    const on = it.key === value;
    return /*#__PURE__*/React.createElement("button", {
      key: it.key,
      onClick: () => onSelect && onSelect(it.key),
      onMouseEnter: () => setHover(it.key),
      onMouseLeave: () => setHover(null),
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-5)',
        width: '100%',
        height: 34,
        padding: '0 var(--space-5)',
        border: 0,
        cursor: 'pointer',
        borderRadius: 'var(--radius-control)',
        textAlign: 'left',
        background: on ? 'var(--bg-page)' : hover === it.key ? 'var(--bg-hover)' : 'transparent',
        boxShadow: on ? 'inset 0 0 0 1px var(--border-default)' : 'none',
        color: on ? 'var(--text-primary)' : 'var(--text-secondary)',
        fontSize: 'var(--size-xs)',
        fontWeight: on ? 'var(--weight-medium)' : 'var(--weight-regular)',
        fontFamily: 'var(--font-core)',
        transition: 'var(--transition-control)'
      }
    }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: it.icon,
      size: 16
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }
    }, it.label), it.count != null ? /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 'var(--size-3xs)',
        color: 'var(--text-tertiary)',
        fontVariantNumeric: 'tabular-nums'
      }
    }, it.count) : null);
  })), footer ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'auto',
      padding: 'var(--space-6)',
      borderTop: '1px solid var(--border-default)'
    }
  }, footer) : null);
}
Object.assign(__ds_scope, { SidebarNav });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/SidebarNav.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Tabs.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Tabs({
  items = [],
  value,
  onChange,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "tablist",
    style: {
      display: 'flex',
      gap: 'var(--space-8)',
      borderBottom: '1px solid var(--border-default)',
      ...style
    }
  }, rest), items.map(it => {
    const key = typeof it === 'string' ? it : it.key;
    const label = typeof it === 'string' ? it : it.label;
    const count = typeof it === 'string' ? undefined : it.count;
    const on = key === value;
    return /*#__PURE__*/React.createElement("button", {
      key: key,
      role: "tab",
      "aria-selected": on,
      onClick: () => onChange && onChange(key),
      style: {
        border: 0,
        background: 'none',
        cursor: 'pointer',
        padding: 'var(--space-5) 0',
        marginBottom: -1,
        borderBottom: '2px solid ' + (on ? 'var(--n-950)' : 'transparent'),
        fontFamily: 'var(--font-core)',
        fontSize: 'var(--size-xs)',
        fontWeight: on ? 'var(--weight-medium)' : 'var(--weight-regular)',
        color: on ? 'var(--text-primary)' : 'var(--text-secondary)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-4)',
        transition: 'var(--transition-control)'
      }
    }, label, count != null ? /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 'var(--size-3xs)',
        color: 'var(--text-tertiary)',
        fontVariantNumeric: 'tabular-nums'
      }
    }, count) : null);
  }));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Tabs.jsx", error: String((e && e.message) || e) }); }

// components/navigation/TopBar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function TopBar({
  title,
  subtitle,
  children,
  actions,
  sticky = true,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("header", _extends({
    style: {
      minHeight: 'var(--topbar-h)',
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-6)',
      padding: '0 var(--gutter-app)',
      background: sticky ? 'var(--bg-glass)' : 'var(--bg-page)',
      backdropFilter: sticky ? 'var(--blur-glass)' : undefined,
      WebkitBackdropFilter: sticky ? 'var(--blur-glass)' : undefined,
      borderBottom: '1px solid var(--border-default)',
      position: sticky ? 'sticky' : 'static',
      top: 0,
      zIndex: 20,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, title ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--size-md)',
      fontWeight: 'var(--weight-medium)',
      letterSpacing: 'var(--track-heading)',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, title) : null, subtitle ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--size-2xs)',
      color: 'var(--text-tertiary)'
    }
  }, subtitle) : null), children, actions ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: 'auto',
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-4)'
    }
  }, actions) : null);
}
Object.assign(__ds_scope, { TopBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/TopBar.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/Anbud.jsx
try { (() => {
const {
  Card,
  Table,
  StatusDot,
  Button,
  Toolbar,
  SegmentedControl,
  Input,
  Tag,
  Metric,
  Modal,
  Field,
  Select,
  Textarea,
  EmptyState
} = window.KopplaDesignSystem_4b46f2;
function Anbud({
  onCreated
}) {
  const d = window.KopplasData;
  const [filter, setFilter] = React.useState('Alla');
  const [open, setOpen] = React.useState(false);
  const rows = filter === 'Alla' ? d.anbud : d.anbud.filter(r => filter === 'Utkast' ? r.status === 'draft' : r.status !== 'draft');
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 'var(--space-8)',
      maxWidth: 1240
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 'var(--space-8)'
    }
  }, /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(Metric, {
    size: "sm",
    label: "Anbudsv\xE4rde ute",
    value: "1 500 500 kr",
    delta: "3 anbud"
  })), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(Metric, {
    size: "sm",
    label: "Vinstgrad 12 m\xE5n",
    value: "41 %",
    delta: "\u2191 6 %",
    deltaTone: "up"
  })), /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement(Metric, {
    size: "sm",
    label: "Snittid till svar",
    value: "9 dagar"
  }))), /*#__PURE__*/React.createElement(Toolbar, {
    right: /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      icon: "plus",
      onClick: () => setOpen(true)
    }, "Nytt anbud")
  }, /*#__PURE__*/React.createElement(SegmentedControl, {
    size: "sm",
    options: ['Alla', 'Utkast', 'Skickade'],
    value: filter,
    onChange: setFilter
  }), /*#__PURE__*/React.createElement(Input, {
    size: "sm",
    icon: "search",
    placeholder: "S\xF6k kund eller anbud",
    style: {
      width: 240
    }
  }), /*#__PURE__*/React.createElement(Tag, {
    onRemove: () => {}
  }, "2026")), /*#__PURE__*/React.createElement(Card, {
    padding: "0"
  }, rows.length ? /*#__PURE__*/React.createElement(Table, {
    columns: [{
      key: 'id',
      header: 'Anbudsnr',
      width: 150,
      render: r => /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--size-2xs)'
        }
      }, r.id)
    }, {
      key: 'namn',
      header: 'Anbud',
      render: r => /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
        style: {
          display: 'block'
        }
      }, r.namn), /*#__PURE__*/React.createElement("span", {
        style: {
          display: 'block',
          fontSize: 'var(--size-3xs)',
          color: 'var(--text-tertiary)'
        }
      }, r.kund))
    }, {
      key: 'status',
      header: 'Status',
      render: r => /*#__PURE__*/React.createElement(StatusDot, {
        status: r.status,
        label: r.st
      })
    }, {
      key: 'sannolikhet',
      header: 'Sannolikhet',
      align: 'right'
    }, {
      key: 'sista',
      header: 'Sista svarsdag',
      align: 'right'
    }, {
      key: 'belopp',
      header: 'Belopp',
      align: 'right'
    }],
    rows: rows
  }) : /*#__PURE__*/React.createElement(EmptyState, {
    icon: "file-text",
    title: "Inga anbud i den h\xE4r vyn.",
    description: "Byt filter eller skapa ett nytt anbud.",
    action: /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      onClick: () => setOpen(true)
    }, "Nytt anbud")
  })), /*#__PURE__*/React.createElement(Modal, {
    open: open,
    onClose: () => setOpen(false),
    title: "Nytt anbud",
    description: "Anbudet blir ett projekt n\xE4r kunden accepterar.",
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      onClick: () => setOpen(false)
    }, "Avbryt"), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      onClick: () => {
        setOpen(false);
        onCreated('Anbud sparat som utkast');
      }
    }, "Spara utkast"))
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 'var(--space-6)'
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Ben\xE4mning",
    required: true
  }, /*#__PURE__*/React.createElement(Input, {
    placeholder: "Ex. Solcellsanl\xE4ggning Kv. H\xF6jden"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 'var(--space-6)'
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Kund"
  }, /*#__PURE__*/React.createElement(Select, {
    options: ['Höjden Bostad AB', 'Malmö Parkering', 'Vasastaden Fastigheter AB'],
    placeholder: "V\xE4lj kund"
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Prismodell"
  }, /*#__PURE__*/React.createElement(Select, {
    options: ['Fast pris', 'Löpande räkning', 'ROT'],
    placeholder: "V\xE4lj prismodell"
  }))), /*#__PURE__*/React.createElement(Field, {
    label: "Kort beskrivning",
    hint: "F\xF6ljer med till projektet"
  }, /*#__PURE__*/React.createElement(Textarea, {
    rows: 3,
    placeholder: "Vad ska utf\xF6ras?"
  })))));
}
Object.assign(window, {
  Anbud
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/Anbud.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/AppShell.jsx
try { (() => {
const {
  SidebarNav,
  TopBar,
  Button,
  IconButton,
  Toast
} = window.KopplaDesignSystem_4b46f2;
const NAV = [{
  key: 'oversikt',
  label: 'Översikt',
  icon: 'layout-dashboard'
}, {
  key: 'anbud',
  label: 'Anbud',
  icon: 'file-text',
  count: 4
}, {
  key: 'projekt',
  label: 'Projekt',
  icon: 'folder-open',
  count: 5
}, {
  key: 'tid',
  label: 'Tid & attest',
  icon: 'clock',
  count: 2
}, {
  section: 'Företaget'
}, {
  key: 'tillgangar',
  label: 'Tillgångar',
  icon: 'truck'
}, {
  key: 'fakturor',
  label: 'Fakturering',
  icon: 'receipt',
  count: 1
}, {
  section: 'Övrigt'
}, {
  key: 'installningar',
  label: 'Inställningar',
  icon: 'settings'
}];
function AppShell({
  view,
  onNavigate,
  title,
  subtitle,
  actions,
  toast,
  onToastClose,
  children,
  tabs
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      height: '100%',
      minHeight: 0,
      background: 'var(--bg-page)'
    }
  }, /*#__PURE__*/React.createElement(SidebarNav, {
    items: NAV,
    value: view,
    onSelect: onNavigate,
    footer: /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-5)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 26,
        height: 26,
        borderRadius: 'var(--radius-pill)',
        background: 'var(--n-200)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 'var(--size-3xs)',
        fontWeight: 'var(--weight-medium)'
      }
    }, "MS"), /*#__PURE__*/React.createElement("span", {
      style: {
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        fontSize: 'var(--size-2xs)',
        fontWeight: 'var(--weight-medium)'
      }
    }, "Maria Sandell"), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        fontSize: 'var(--size-3xs)',
        color: 'var(--text-tertiary)'
      }
    }, "Elpro Syd AB")), /*#__PURE__*/React.createElement(IconButton, {
      icon: "chevron-right",
      label: "Konto",
      size: "sm",
      style: {
        marginLeft: 'auto'
      }
    }))
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement(TopBar, {
    title: title,
    subtitle: subtitle,
    actions: actions
  }), tabs ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 var(--gutter-app)',
      borderBottom: '1px solid var(--border-default)'
    }
  }, tabs) : null, /*#__PURE__*/React.createElement("main", {
    style: {
      flex: 1,
      minHeight: 0,
      overflowY: 'auto',
      padding: 'var(--space-8) var(--gutter-app) var(--space-12)'
    }
  }, children)), toast ? /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      bottom: 'var(--space-9)',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 200
    }
  }, /*#__PURE__*/React.createElement(Toast, {
    tone: "ok",
    message: toast,
    onDismiss: onToastClose
  })) : null);
}
Object.assign(window, {
  AppShell,
  KOPPLA_NAV: NAV
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/AppShell.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/Fakturering.jsx
try { (() => {
const {
  Card,
  Table,
  StatusDot,
  Button,
  Toolbar,
  Input,
  Metric,
  Modal,
  Field,
  Select,
  Checkbox,
  Divider,
  Badge,
  Banner,
  Tabs
} = window.KopplaDesignSystem_4b46f2;
function Fakturering({
  onSent,
  openDraft
}) {
  const d = window.KopplasData;
  const [open, setOpen] = React.useState(!!openDraft);
  React.useEffect(() => {
    if (openDraft) setOpen(true);
  }, [openDraft]);
  const [rot, setRot] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 'var(--space-8)',
      maxWidth: 1240
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-card)',
      overflow: 'hidden'
    }
  }, [['Fakturerat i mars', '284 500 kr'], ['Utestående', '228 900 kr'], ['Förfallet', '18 900 kr'], ['Underlag att fakturera', '3']].map(([l, v], i) => /*#__PURE__*/React.createElement("div", {
    key: l,
    style: {
      padding: 'var(--space-8)',
      borderLeft: i === 0 ? 'none' : '1px solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement(Metric, {
    size: "sm",
    label: l,
    value: v
  })))), /*#__PURE__*/React.createElement(Banner, {
    tone: "warn",
    title: "En faktura \xE4r f\xF6rfallen sedan 26 februari",
    action: /*#__PURE__*/React.createElement(Button, {
      size: "sm"
    }, "Skicka p\xE5minnelse")
  }), /*#__PURE__*/React.createElement(Toolbar, {
    right: /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      icon: "plus",
      onClick: () => setOpen(true)
    }, "Ny faktura")
  }, /*#__PURE__*/React.createElement(Input, {
    size: "sm",
    icon: "search",
    placeholder: "S\xF6k faktura eller kund",
    style: {
      width: 260
    }
  }), /*#__PURE__*/React.createElement(Badge, {
    tone: "neutral"
  }, "4 fakturor")), /*#__PURE__*/React.createElement(Card, {
    padding: "0"
  }, /*#__PURE__*/React.createElement(Table, {
    columns: [{
      key: 'id',
      header: 'Fakturanr',
      width: 140,
      render: r => /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--size-2xs)'
        }
      }, r.id)
    }, {
      key: 'kund',
      header: 'Kund'
    }, {
      key: 'projekt',
      header: 'Projekt',
      render: r => /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--size-2xs)'
        }
      }, r.projekt)
    }, {
      key: 'status',
      header: 'Status',
      render: r => /*#__PURE__*/React.createElement(StatusDot, {
        status: r.status,
        label: r.st
      })
    }, {
      key: 'forfall',
      header: 'Förfaller',
      align: 'right'
    }, {
      key: 'belopp',
      header: 'Belopp',
      align: 'right'
    }],
    rows: d.fakturor
  })), /*#__PURE__*/React.createElement(Modal, {
    open: open,
    onClose: () => setOpen(false),
    width: 560,
    title: "Faktura \xB7 Ombyggnad Kv. Vasa 4",
    description: "Underlaget \xE4r h\xE4mtat fr\xE5n attesterad tid och material fram till 12 mars.",
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      onClick: () => setOpen(false)
    }, "Avbryt"), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      onClick: () => {
        setOpen(false);
        onSent('Fakturan skickad · 96 000 kr');
      }
    }, "Skicka faktura"))
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 'var(--space-6)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 'var(--space-6)'
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Kund"
  }, /*#__PURE__*/React.createElement(Select, {
    options: ['Vasastaden Fastigheter AB']
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Betalningsvillkor"
  }, /*#__PURE__*/React.createElement(Select, {
    options: ['30 dagar', '15 dagar', '10 dagar']
  }))), /*#__PURE__*/React.createElement(Divider, null), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 'var(--space-5)'
    }
  }, [['Arbetad tid · 184 h', '64 400 kr'], ['Material', '28 600 kr'], ['ÄTA-03 Flytt av central', '3 000 kr']].map(([l, v]) => /*#__PURE__*/React.createElement("div", {
    key: l,
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: 'var(--size-xs)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-secondary)'
    }
  }, l), /*#__PURE__*/React.createElement("span", {
    style: {
      fontVariantNumeric: 'tabular-nums'
    }
  }, v))), /*#__PURE__*/React.createElement(Divider, null), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: 'var(--size-md)',
      fontWeight: 'var(--weight-medium)'
    }
  }, /*#__PURE__*/React.createElement("span", null, "Att betala"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontVariantNumeric: 'tabular-nums'
    }
  }, "96 000 kr"))), /*#__PURE__*/React.createElement(Checkbox, {
    label: "ROT-avdrag p\xE5 arbetskostnad",
    checked: rot,
    onChange: () => setRot(!rot)
  }))));
}
function TidAttest({
  onAttested
}) {
  const d = window.KopplasData;
  const [sel, setSel] = React.useState({
    1: true,
    2: true
  });
  const count = Object.values(sel).filter(Boolean).length;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 'var(--space-8)',
      maxWidth: 1240
    }
  }, /*#__PURE__*/React.createElement(Toolbar, {
    right: /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      disabled: !count,
      onClick: () => onAttested(count + ' tidrapporter attesterade')
    }, "Attestera ", count || '')
  }, /*#__PURE__*/React.createElement(Input, {
    size: "sm",
    icon: "search",
    placeholder: "S\xF6k person eller projekt",
    style: {
      width: 240
    }
  })), /*#__PURE__*/React.createElement(Card, {
    padding: "0"
  }, /*#__PURE__*/React.createElement(Table, {
    columns: [{
      key: 'valj',
      header: '',
      width: 44,
      render: r => /*#__PURE__*/React.createElement(Checkbox, {
        checked: !!sel[r.id],
        onChange: () => setSel(s => ({
          ...s,
          [r.id]: !s[r.id]
        }))
      })
    }, {
      key: 'datum',
      header: 'Datum',
      width: 120
    }, {
      key: 'person',
      header: 'Person'
    }, {
      key: 'projekt',
      header: 'Projekt'
    }, {
      key: 'typ',
      header: 'Arbetsmoment'
    }, {
      key: 'status',
      header: 'Status',
      render: r => /*#__PURE__*/React.createElement(StatusDot, {
        status: r.status,
        label: r.st
      })
    }, {
      key: 'timmar',
      header: 'Tid',
      align: 'right'
    }],
    rows: d.tid
  })));
}
Object.assign(window, {
  Fakturering,
  TidAttest
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/Fakturering.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/Installningar.jsx
try { (() => {
const {
  Card,
  Field,
  Input,
  Select,
  Switch,
  Divider,
  Button,
  Radio,
  Toolbar,
  Badge
} = window.KopplaDesignSystem_4b46f2;
function Installningar() {
  const [notis, setNotis] = React.useState(true);
  const [auto, setAuto] = React.useState(false);
  const [pris, setPris] = React.useState('lopande');
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 'var(--space-8)',
      maxWidth: 820
    }
  }, /*#__PURE__*/React.createElement(Card, {
    title: "F\xF6retag"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 'var(--space-6)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 'var(--space-6)'
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "F\xF6retagsnamn"
  }, /*#__PURE__*/React.createElement(Input, {
    defaultValue: "Elpro Syd AB"
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Organisationsnummer"
  }, /*#__PURE__*/React.createElement(Input, {
    defaultValue: "556123-4567"
  }))), /*#__PURE__*/React.createElement(Field, {
    label: "Fakturaadress",
    hint: "Visas p\xE5 alla utg\xE5ende fakturor"
  }, /*#__PURE__*/React.createElement(Input, {
    defaultValue: "Bergsgatan 12, 214 22 Malm\xF6"
  })))), /*#__PURE__*/React.createElement(Card, {
    title: "Standardv\xE4rden"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 'var(--space-6)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 'var(--space-6)'
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Betalningsvillkor"
  }, /*#__PURE__*/React.createElement(Select, {
    options: ['30 dagar', '15 dagar', '10 dagar']
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Timpris installation"
  }, /*#__PURE__*/React.createElement(Input, {
    defaultValue: "795",
    suffix: "kr"
  }))), /*#__PURE__*/React.createElement(Divider, null), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 'var(--space-5)'
    }
  }, /*#__PURE__*/React.createElement(Radio, {
    name: "pris",
    label: "L\xF6pande r\xE4kning",
    description: "Faktureras per attesterad timme",
    checked: pris === 'lopande',
    onChange: () => setPris('lopande')
  }), /*#__PURE__*/React.createElement(Radio, {
    name: "pris",
    label: "Fast pris",
    description: "Delfaktureras enligt betalplan",
    checked: pris === 'fast',
    onChange: () => setPris('fast')
  })))), /*#__PURE__*/React.createElement(Card, {
    title: "Notiser"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 'var(--space-6)'
    }
  }, /*#__PURE__*/React.createElement(Switch, {
    checked: notis,
    onChange: () => setNotis(!notis),
    label: "Notis n\xE4r tid v\xE4ntar p\xE5 attest"
  }), /*#__PURE__*/React.createElement(Switch, {
    checked: auto,
    onChange: () => setAuto(!auto),
    label: "Skicka betalningsp\xE5minnelse automatiskt"
  })), /*#__PURE__*/React.createElement(Divider, {
    style: {
      margin: 'var(--space-7) 0 var(--space-6)'
    }
  }), /*#__PURE__*/React.createElement(Toolbar, {
    right: /*#__PURE__*/React.createElement(Button, {
      variant: "primary"
    }, "Spara")
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "neutral"
  }, "\xC4ndringar sparas inte automatiskt"))));
}
Object.assign(window, {
  Installningar
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/Installningar.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/Oversikt.jsx
try { (() => {
const {
  Card,
  Metric,
  Banner,
  Button,
  Table,
  StatusDot,
  PhaseChain,
  ProgressBar,
  Timeline,
  Divider,
  SegmentedControl
} = window.KopplaDesignSystem_4b46f2;
function Oversikt({
  onOpenProject,
  onGoto
}) {
  const [range, setRange] = React.useState('Månad');
  const d = window.KopplasData;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 'var(--space-8)',
      maxWidth: 1240
    }
  }, /*#__PURE__*/React.createElement(Banner, {
    tone: "warn",
    title: "2 tidrapporter v\xE4ntar p\xE5 attest",
    action: /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      onClick: () => onGoto('tid')
    }, "Granska")
  }, "Attestera f\xF6re fredag s\xE5 kommer de med p\xE5 marsfakturan."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 'var(--space-6)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--size-3xs)',
      letterSpacing: 'var(--track-caps)',
      textTransform: 'uppercase',
      color: 'var(--text-tertiary)'
    }
  }, "Nyckeltal"), /*#__PURE__*/React.createElement(SegmentedControl, {
    options: ['Vecka', 'Månad', 'År'],
    value: range,
    onChange: setRange,
    size: "sm"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-card)',
      overflow: 'hidden'
    }
  }, [{
    label: 'Fakturerat i mars',
    value: '284 500 kr',
    delta: '↑ 4 %',
    tone: 'up'
  }, {
    label: 'Ej fakturerat',
    value: '61 200 kr',
    delta: '3 underlag',
    tone: 'neutral'
  }, {
    label: 'Debiteringsgrad',
    value: '84 %',
    delta: '↓ 2 %',
    tone: 'down'
  }, {
    label: 'Aktiva projekt',
    value: '5',
    delta: '2 i slutfas',
    tone: 'neutral'
  }].map((m, i) => /*#__PURE__*/React.createElement("div", {
    key: m.label,
    style: {
      padding: 'var(--space-8)',
      borderLeft: i === 0 ? 'none' : '1px solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement(Metric, {
    label: m.label,
    value: m.value,
    delta: m.delta,
    deltaTone: m.tone,
    size: "sm"
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1.6fr 1fr',
      gap: 'var(--space-8)',
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    title: "Projekt i drift",
    action: /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "ghost",
      onClick: () => onGoto('projekt')
    }, "Visa alla"),
    padding: "0"
  }, /*#__PURE__*/React.createElement(Table, {
    onRowClick: r => onOpenProject(r.id),
    columns: [{
      key: 'namn',
      header: 'Projekt',
      render: r => /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
        style: {
          display: 'block'
        }
      }, r.namn), /*#__PURE__*/React.createElement("span", {
        style: {
          display: 'block',
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--size-3xs)',
          color: 'var(--text-tertiary)'
        }
      }, r.id))
    }, {
      key: 'status',
      header: 'Status',
      render: r => /*#__PURE__*/React.createElement(StatusDot, {
        status: r.status,
        label: r.st
      })
    }, {
      key: 'timmar',
      header: 'Timmar',
      align: 'right'
    }, {
      key: 'belopp',
      header: 'Kontrakt',
      align: 'right'
    }],
    rows: d.projekt.slice(0, 4)
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 'var(--space-8)'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    title: "Kv. Vasa 4 \xB7 n\xE4sta steg"
  }, /*#__PURE__*/React.createElement(PhaseChain, {
    compact: true,
    current: 2,
    phases: [{
      label: 'Prospekt'
    }, {
      label: 'Projektering'
    }, {
      label: 'Genomförande'
    }, {
      label: 'Dokument'
    }, {
      label: 'Faktura'
    }]
  }), /*#__PURE__*/React.createElement(Divider, {
    style: {
      margin: 'var(--space-7) 0 var(--space-6)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 'var(--space-6)'
    }
  }, /*#__PURE__*/React.createElement(ProgressBar, {
    label: "Nedlagda timmar",
    valueLabel: "184 / 300 h",
    value: 61
  }), /*#__PURE__*/React.createElement(ProgressBar, {
    label: "Materialbudget",
    valueLabel: "72 %",
    value: 72
  }))), /*#__PURE__*/React.createElement(Card, {
    title: "Senaste h\xE4ndelser"
  }, /*#__PURE__*/React.createElement(Timeline, {
    items: [{
      time: '12 mars 07:12',
      title: 'Tid rapporterad · 8 h',
      meta: 'Anders L. · Kv. Vasa 4',
      tone: 'active'
    }, {
      time: '11 mars 16:40',
      title: 'Egenkontroll signerad',
      meta: 'Maria S. · Hyllie P2'
    }, {
      time: '11 mars 09:03',
      title: 'Avvikelse rapporterad',
      meta: 'Anders L. · Hyllie P2'
    }, {
      time: '10 mars 14:22',
      title: 'Anbud skickat · 1 240 000 kr',
      meta: 'Höjden Bostad AB'
    }]
  })))));
}
Object.assign(window, {
  Oversikt
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/Oversikt.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/ProjektDetalj.jsx
try { (() => {
const {
  Card,
  Metric,
  Table,
  StatusDot,
  PhaseChain,
  ProgressBar,
  Tabs,
  Breadcrumbs,
  Button,
  Badge,
  Tag,
  Checkbox,
  Divider,
  Timeline,
  Field,
  Input,
  EmptyState,
  Banner
} = window.KopplaDesignSystem_4b46f2;
function ProjektDetalj({
  projectId,
  onBack,
  onInvoice
}) {
  const d = window.KopplasData;
  const p = d.projekt.find(x => x.id === projectId) || d.projekt[0];
  const [tab, setTab] = React.useState('oversikt');
  const [checks, setChecks] = React.useState({
    a: true,
    b: true,
    c: false,
    d: false
  });
  const toggle = k => setChecks(s => ({
    ...s,
    [k]: !s[k]
  }));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 'var(--space-8)',
      maxWidth: 1240
    }
  }, /*#__PURE__*/React.createElement(Breadcrumbs, {
    items: [{
      label: 'Projekt',
      href: '#'
    }, {
      label: p.namn
    }]
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 'var(--space-8)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 'var(--size-2xl)',
      fontWeight: 'var(--weight-medium)',
      letterSpacing: 'var(--track-heading)'
    }
  }, p.namn), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-5)',
      marginTop: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--size-2xs)',
      color: 'var(--text-tertiary)'
    }
  }, p.id), /*#__PURE__*/React.createElement(StatusDot, {
    status: p.status,
    label: p.st
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--size-2xs)',
      color: 'var(--text-secondary)'
    }
  }, p.kund), p.status === 'deviation' ? /*#__PURE__*/React.createElement(Badge, {
    tone: "risk"
  }, "\xD6ver budget") : null)), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: 'auto',
      display: 'flex',
      gap: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    icon: "arrow-left",
    onClick: onBack
  }, "Tillbaka"), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    icon: "file-plus"
  }, "\xC4TA"), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    icon: "receipt",
    onClick: onInvoice
  }, "Skapa faktura"))), /*#__PURE__*/React.createElement(Card, {
    padding: "var(--space-8)"
  }, /*#__PURE__*/React.createElement(PhaseChain, {
    current: p.fas,
    onSelect: () => {},
    phases: [{
      label: 'Prospektering',
      meta: 'Klar 4 feb'
    }, {
      label: 'Projektering',
      meta: 'Klar 26 feb'
    }, {
      label: 'Genomförande',
      meta: p.pct + ' % rapporterat'
    }, {
      label: 'Dokumentering',
      meta: '2 av 6 klara'
    }, {
      label: 'Fakturering',
      meta: 'Ej påbörjad'
    }]
  })), /*#__PURE__*/React.createElement(Tabs, {
    value: tab,
    onChange: setTab,
    items: [{
      key: 'oversikt',
      label: 'Översikt'
    }, {
      key: 'tid',
      label: 'Tid',
      count: 34
    }, {
      key: 'material',
      label: 'Material',
      count: 12
    }, {
      key: 'dok',
      label: 'Dokument',
      count: 8
    }, {
      key: 'ata',
      label: 'ÄTA',
      count: 2
    }]
  }), tab === 'oversikt' ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: 'var(--space-8)',
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    title: "Ekonomi"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 'var(--space-7)'
    }
  }, /*#__PURE__*/React.createElement(Metric, {
    size: "sm",
    label: "Kontrakt",
    value: p.belopp
  }), /*#__PURE__*/React.createElement(Metric, {
    size: "sm",
    label: "Fakturerat",
    value: "188 500 kr",
    delta: "66 %"
  }), /*#__PURE__*/React.createElement(Divider, null), /*#__PURE__*/React.createElement(ProgressBar, {
    label: "Nedlagda timmar",
    valueLabel: p.timmar,
    value: p.pct,
    tone: p.pct > 100 ? 'risk' : 'ink'
  }))), /*#__PURE__*/React.createElement(Card, {
    title: "Egenkontroll",
    action: /*#__PURE__*/React.createElement(Badge, {
      tone: "warn"
    }, "2 av 4")
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 'var(--space-5)'
    }
  }, /*#__PURE__*/React.createElement(Checkbox, {
    label: "Isolationsm\xE4tning centraler",
    checked: checks.a,
    onChange: () => toggle('a')
  }), /*#__PURE__*/React.createElement(Checkbox, {
    label: "Jordfelsbrytare provade",
    checked: checks.b,
    onChange: () => toggle('b')
  }), /*#__PURE__*/React.createElement(Checkbox, {
    label: "M\xE4rkning schakt 3",
    checked: checks.c,
    onChange: () => toggle('c')
  }), /*#__PURE__*/React.createElement(Checkbox, {
    label: "Relationsritning uppdaterad",
    checked: checks.d,
    onChange: () => toggle('d')
  })), /*#__PURE__*/React.createElement(Divider, {
    style: {
      margin: 'var(--space-7) 0 var(--space-6)'
    }
  }), /*#__PURE__*/React.createElement(Button, {
    size: "sm",
    fullWidth: true
  }, "Signera kontroll")), /*#__PURE__*/React.createElement(Card, {
    title: "Bemanning"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement(Tag, {
    icon: "user"
  }, "Anders L."), /*#__PURE__*/React.createElement(Tag, {
    icon: "user"
  }, "Johan R."), /*#__PURE__*/React.createElement(Tag, {
    icon: "user"
  }, "Maria S. \xB7 PL"), /*#__PURE__*/React.createElement(Tag, {
    icon: "user"
  }, "Elin K.")), /*#__PURE__*/React.createElement(Divider, {
    style: {
      margin: 'var(--space-7) 0 var(--space-6)'
    }
  }), /*#__PURE__*/React.createElement(Field, {
    label: "Planerad slutdatum"
  }, /*#__PURE__*/React.createElement(Input, {
    defaultValue: p.slut,
    icon: "calendar"
  })))) : null, tab === 'tid' ? /*#__PURE__*/React.createElement(Card, {
    padding: "0",
    title: "Rapporterad tid",
    action: /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "primary"
    }, "Attestera valda")
  }, /*#__PURE__*/React.createElement(Table, {
    columns: [{
      key: 'datum',
      header: 'Datum',
      width: 120
    }, {
      key: 'person',
      header: 'Person'
    }, {
      key: 'typ',
      header: 'Arbetsmoment'
    }, {
      key: 'status',
      header: 'Status',
      render: r => /*#__PURE__*/React.createElement(StatusDot, {
        status: r.status,
        label: r.st
      })
    }, {
      key: 'timmar',
      header: 'Tid',
      align: 'right'
    }],
    rows: d.tid
  })) : null, tab === 'material' ? /*#__PURE__*/React.createElement(Card, {
    padding: "0",
    title: "Materiallista"
  }, /*#__PURE__*/React.createElement(Table, {
    dense: true,
    columns: [{
      key: 'art',
      header: 'Artikelnr',
      width: 140
    }, {
      key: 'namn',
      header: 'Benämning'
    }, {
      key: 'antal',
      header: 'Antal',
      align: 'right'
    }, {
      key: 'pris',
      header: 'Summa',
      align: 'right'
    }],
    rows: [{
      id: 1,
      art: 'E-2049112',
      namn: 'Kabel EQLQ 5G2,5',
      antal: '420 m',
      pris: '18 480 kr'
    }, {
      id: 2,
      art: 'E-1188430',
      namn: 'Kabelstege 300 mm',
      antal: '64 m',
      pris: '22 100 kr'
    }, {
      id: 3,
      art: 'E-3390021',
      namn: 'Jordfelsbrytare 4P 40A',
      antal: '12 st',
      pris: '9 360 kr'
    }, {
      id: 4,
      art: 'E-7712004',
      namn: 'Apparatdosa infälld',
      antal: '86 st',
      pris: '3 010 kr'
    }]
  })) : null, tab === 'dok' ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1.4fr 1fr',
      gap: 'var(--space-8)',
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    padding: "0",
    title: "Dokument",
    action: /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      icon: "upload"
    }, "Ladda upp")
  }, /*#__PURE__*/React.createElement(Table, {
    dense: true,
    columns: [{
      key: 'namn',
      header: 'Fil'
    }, {
      key: 'typ',
      header: 'Typ'
    }, {
      key: 'av',
      header: 'Uppladdad av'
    }, {
      key: 'datum',
      header: 'Datum',
      align: 'right'
    }],
    rows: [{
      id: 1,
      namn: 'Relationsritning A-2.pdf',
      typ: 'Ritning',
      av: 'Maria S.',
      datum: '2026-03-08'
    }, {
      id: 2,
      namn: 'Egenkontroll centraler.pdf',
      typ: 'Protokoll',
      av: 'Anders L.',
      datum: '2026-03-06'
    }, {
      id: 3,
      namn: 'Isolationsmätning schakt 1-2.csv',
      typ: 'Mätdata',
      av: 'Anders L.',
      datum: '2026-03-06'
    }]
  })), /*#__PURE__*/React.createElement(Card, {
    title: "Historik"
  }, /*#__PURE__*/React.createElement(Timeline, {
    items: [{
      time: '12 mars',
      title: 'Dokument tillagt',
      meta: 'Relationsritning A-2',
      tone: 'active'
    }, {
      time: '6 mars',
      title: 'Protokoll signerat',
      meta: 'Anders L.'
    }, {
      time: '26 feb',
      title: 'Projektering avslutad',
      meta: 'Maria S.'
    }]
  }))) : null, tab === 'ata' ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 'var(--space-8)'
    }
  }, /*#__PURE__*/React.createElement(Banner, {
    tone: "info",
    title: "\xC4TA m\xE5ste godk\xE4nnas av kund innan arbetet p\xE5b\xF6rjas"
  }), /*#__PURE__*/React.createElement(Card, {
    padding: "0"
  }, /*#__PURE__*/React.createElement(Table, {
    columns: [{
      key: 'id',
      header: 'ÄTA',
      width: 120
    }, {
      key: 'namn',
      header: 'Beskrivning'
    }, {
      key: 'status',
      header: 'Status',
      render: r => /*#__PURE__*/React.createElement(StatusDot, {
        status: r.status,
        label: r.st
      })
    }, {
      key: 'belopp',
      header: 'Belopp',
      align: 'right'
    }],
    rows: [{
      id: 'ÄTA-04',
      namn: 'Extra uttag konferensrum',
      status: 'waiting',
      st: 'Väntar godkännande',
      belopp: '14 200 kr'
    }, {
      id: 'ÄTA-03',
      namn: 'Flytt av central plan 2',
      status: 'done',
      st: 'Godkänd',
      belopp: '31 800 kr'
    }]
  }))) : null);
}
Object.assign(window, {
  ProjektDetalj
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/ProjektDetalj.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/Tillgangar.jsx
try { (() => {
const {
  Card,
  Table,
  StatusDot,
  Button,
  Toolbar,
  SegmentedControl,
  Input,
  Banner,
  Metric,
  Timeline,
  Divider,
  Switch
} = window.KopplaDesignSystem_4b46f2;
function Tillgangar() {
  const d = window.KopplasData;
  const [typ, setTyp] = React.useState('Alla');
  const [auto, setAuto] = React.useState(true);
  const rows = typ === 'Alla' ? d.tillgangar : d.tillgangar.filter(r => r.typ === typ);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 'var(--space-8)',
      maxWidth: 1240
    }
  }, /*#__PURE__*/React.createElement(Banner, {
    tone: "risk",
    title: "Kalibrering f\xF6rfallen \xB7 Isolationsprovare Megger (INS-207)",
    action: /*#__PURE__*/React.createElement(Button, {
      size: "sm"
    }, "Boka kalibrering")
  }, "Instrumentet f\xE5r inte anv\xE4ndas f\xF6r protokollf\xF6rda m\xE4tningar f\xF6rr\xE4n det \xE4r kalibrerat."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: 'var(--space-8)',
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 'var(--space-6)'
    }
  }, /*#__PURE__*/React.createElement(Toolbar, {
    right: /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      icon: "plus"
    }, "Ny tillg\xE5ng")
  }, /*#__PURE__*/React.createElement(SegmentedControl, {
    size: "sm",
    options: ['Alla', 'Fordon', 'Instrument', 'Verktyg'],
    value: typ,
    onChange: setTyp
  }), /*#__PURE__*/React.createElement(Input, {
    size: "sm",
    icon: "search",
    placeholder: "S\xF6k tillg\xE5ng",
    style: {
      width: 220
    }
  })), /*#__PURE__*/React.createElement(Card, {
    padding: "0"
  }, /*#__PURE__*/React.createElement(Table, {
    columns: [{
      key: 'namn',
      header: 'Tillgång',
      render: r => /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
        style: {
          display: 'block'
        }
      }, r.namn), /*#__PURE__*/React.createElement("span", {
        style: {
          display: 'block',
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--size-3xs)',
          color: 'var(--text-tertiary)'
        }
      }, r.id, " \xB7 ", r.reg))
    }, {
      key: 'typ',
      header: 'Typ',
      width: 110
    }, {
      key: 'status',
      header: 'Status',
      render: r => /*#__PURE__*/React.createElement(StatusDot, {
        status: r.status,
        label: r.st
      })
    }, {
      key: 'ansvarig',
      header: 'Hos',
      width: 120
    }, {
      key: 'nasta',
      header: 'Nästa åtgärd',
      align: 'right'
    }],
    rows: rows
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 'var(--space-8)'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    title: "Underh\xE5ll"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 'var(--space-7)'
    }
  }, /*#__PURE__*/React.createElement(Metric, {
    size: "sm",
    label: "\xC5tg\xE4rder inom 30 dagar",
    value: "4"
  }), /*#__PURE__*/React.createElement(Metric, {
    size: "sm",
    label: "F\xF6rfallna",
    value: "1",
    deltaTone: "down",
    delta: "INS-207"
  }), /*#__PURE__*/React.createElement(Divider, null), /*#__PURE__*/React.createElement(Switch, {
    checked: auto,
    onChange: () => setAuto(!auto),
    label: "P\xE5minn ansvarig 14 dagar innan"
  }))), /*#__PURE__*/React.createElement(Card, {
    title: "Planerat underh\xE5ll"
  }, /*#__PURE__*/React.createElement(Timeline, {
    items: [{
      time: '19 mars',
      title: 'Ford Transit åter från verkstad',
      meta: 'DEF 45Y',
      tone: 'active'
    }, {
      time: '21 mars',
      title: 'Kärnborrmaskin åter',
      meta: 'Hyllie P2'
    }, {
      time: '2 april',
      title: 'Service VW Crafter',
      meta: 'ABC 12X'
    }, {
      time: '14 sep',
      title: 'Kalibrering installationstestare',
      meta: 'INS-211'
    }]
  })))));
}
Object.assign(window, {
  Tillgangar
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/Tillgangar.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/data.js
try { (() => {
window.KopplasData = {
  projekt: [{
    id: 'PRJ-2026-0184',
    namn: 'Ombyggnad Kv. Vasa 4',
    kund: 'Vasastaden Fastigheter AB',
    status: 'active',
    st: 'Pågår',
    fas: 2,
    timmar: '184 / 300 h',
    pct: 61,
    belopp: '284 500 kr',
    pl: 'Maria S.',
    slut: '2026-04-18'
  }, {
    id: 'PRJ-2026-0179',
    namn: 'Serviceavtal Bergsgatan 12',
    kund: 'Bergsgatan Samfällighet',
    status: 'waiting',
    st: 'Väntar attest',
    fas: 3,
    timmar: '38 / 40 h',
    pct: 95,
    belopp: '42 100 kr',
    pl: 'Anders L.',
    slut: '2026-03-29'
  }, {
    id: 'PRJ-2026-0171',
    namn: 'Laddstolpar Hyllie P2',
    kund: 'Malmö Parkering',
    status: 'deviation',
    st: 'Avvikelse',
    fas: 2,
    timmar: '412 / 380 h',
    pct: 108,
    belopp: '611 000 kr',
    pl: 'Maria S.',
    slut: '2026-05-02'
  }, {
    id: 'PRJ-2026-0166',
    namn: 'Ny elcentral Lundby skola',
    kund: 'Göteborgs Stad',
    status: 'planned',
    st: 'Planerad',
    fas: 1,
    timmar: '0 / 210 h',
    pct: 0,
    belopp: '318 000 kr',
    pl: 'Johan R.',
    slut: '2026-06-11'
  }, {
    id: 'PRJ-2026-0158',
    namn: 'Belysning lager Arlöv',
    kund: 'Nordlog AB',
    status: 'done',
    st: 'Klart',
    fas: 4,
    timmar: '96 / 100 h',
    pct: 96,
    belopp: '129 400 kr',
    pl: 'Anders L.',
    slut: '2026-02-27'
  }],
  anbud: [{
    id: 'ANB-2026-0042',
    namn: 'Solcellsanläggning Kv. Höjden',
    kund: 'Höjden Bostad AB',
    status: 'waiting',
    st: 'Skickat',
    belopp: '1 240 000 kr',
    sista: '2026-03-20',
    sannolikhet: '60 %'
  }, {
    id: 'ANB-2026-0041',
    namn: 'Ombyggnad kontor Norra Vallgatan',
    kund: 'Vallgatan Förvaltning',
    status: 'draft',
    st: 'Utkast',
    belopp: '186 000 kr',
    sista: '2026-03-24',
    sannolikhet: '—'
  }, {
    id: 'ANB-2026-0039',
    namn: 'Service brandlarm Hyllie',
    kund: 'Malmö Parkering',
    status: 'active',
    st: 'Platsbesök bokat',
    belopp: '74 500 kr',
    sista: '2026-03-18',
    sannolikhet: '80 %'
  }, {
    id: 'ANB-2026-0036',
    namn: 'Utbyte elcentraler etapp 2',
    kund: 'Vasastaden Fastigheter AB',
    status: 'done',
    st: 'Vunnet',
    belopp: '452 000 kr',
    sista: '2026-03-02',
    sannolikhet: '100 %'
  }],
  tillgangar: [{
    id: 'FRD-114',
    namn: 'Servicebil VW Crafter',
    typ: 'Fordon',
    reg: 'ABC 12X',
    status: 'active',
    st: 'I drift',
    ansvarig: 'Anders L.',
    nasta: 'Service 2026-04-02'
  }, {
    id: 'FRD-118',
    namn: 'Servicebil Ford Transit',
    typ: 'Fordon',
    reg: 'DEF 45Y',
    status: 'waiting',
    st: 'På verkstad',
    ansvarig: 'Johan R.',
    nasta: 'Åter 2026-03-19'
  }, {
    id: 'INS-207',
    namn: 'Isolationsprovare Megger',
    typ: 'Instrument',
    reg: 'S/N 88412',
    status: 'deviation',
    st: 'Kalibrering förfallen',
    ansvarig: 'Maria S.',
    nasta: 'Kalibrering 2026-03-01'
  }, {
    id: 'INS-211',
    namn: 'Installationstestare',
    typ: 'Instrument',
    reg: 'S/N 90233',
    status: 'active',
    st: 'I drift',
    ansvarig: 'Anders L.',
    nasta: 'Kalibrering 2026-09-14'
  }, {
    id: 'VRK-052',
    namn: 'Kärnborrmaskin',
    typ: 'Verktyg',
    reg: 'INV 052',
    status: 'planned',
    st: 'Utlånad',
    ansvarig: 'Hyllie P2',
    nasta: 'Åter 2026-03-21'
  }],
  fakturor: [{
    id: 'F-2026-0311',
    kund: 'Vasastaden Fastigheter AB',
    projekt: 'PRJ-2026-0184',
    status: 'draft',
    st: 'Utkast',
    belopp: '96 000 kr',
    forfall: '—'
  }, {
    id: 'F-2026-0308',
    kund: 'Malmö Parkering',
    projekt: 'PRJ-2026-0171',
    status: 'waiting',
    st: 'Skickad',
    belopp: '210 000 kr',
    forfall: '2026-03-28'
  }, {
    id: 'F-2026-0302',
    kund: 'Nordlog AB',
    projekt: 'PRJ-2026-0158',
    status: 'done',
    st: 'Betald',
    belopp: '129 400 kr',
    forfall: '2026-03-04'
  }, {
    id: 'F-2026-0299',
    kund: 'Bergsgatan Samfällighet',
    projekt: 'PRJ-2026-0179',
    status: 'deviation',
    st: 'Förfallen',
    belopp: '18 900 kr',
    forfall: '2026-02-26'
  }],
  tid: [{
    id: 1,
    datum: '2026-03-12',
    person: 'Anders L.',
    projekt: 'Kv. Vasa 4',
    timmar: '8 h',
    typ: 'Installation',
    status: 'waiting',
    st: 'Väntar attest'
  }, {
    id: 2,
    datum: '2026-03-12',
    person: 'Johan R.',
    projekt: 'Hyllie P2',
    timmar: '6 h 30 min',
    typ: 'Kanalisation',
    status: 'waiting',
    st: 'Väntar attest'
  }, {
    id: 3,
    datum: '2026-03-11',
    person: 'Maria S.',
    projekt: 'Kv. Vasa 4',
    timmar: '4 h',
    typ: 'Projektering',
    status: 'done',
    st: 'Attesterad'
  }]
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/data.js", error: String((e && e.message) || e) }); }

// ui_kits/site/Chain.jsx
try { (() => {
const {
  Card,
  PhaseChain,
  Icon,
  Button,
  StatusDot
} = window.KopplaDesignSystem_4b46f2;
const STEG = [{
  icon: 'search',
  titel: 'Prospektering',
  text: 'Leads, platsbesök och anbud i samma flöde. Anbudet blir projekt med ett klick.'
}, {
  icon: 'ruler',
  titel: 'Projektering',
  text: 'Materiallista, tidsbudget och bemanning läggs upp mot kontraktet — inte i ett kalkylblad.'
}, {
  icon: 'hard-hat',
  titel: 'Genomförande',
  text: 'Montören rapporterar tid och avvikelser i mobilen. Projektledaren attesterar en gång i veckan.'
}, {
  icon: 'clipboard-check',
  titel: 'Dokumentering',
  text: 'Egenkontroll, mätprotokoll och relationsritningar samlas per projekt. Överlämning som PDF.'
}, {
  icon: 'receipt',
  titel: 'Fakturering',
  text: 'Attesterad tid och material blir fakturaunderlag. Fast pris, löpande räkning eller ROT.'
}];
function Chain() {
  const [i, setI] = React.useState(2);
  return /*#__PURE__*/React.createElement("section", {
    style: {
      padding: 'var(--space-13) var(--gutter-page)',
      maxWidth: 'var(--page-max)',
      margin: '0 auto',
      borderTop: '1px solid var(--border-default)'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 'var(--size-4xl)',
      fontWeight: 'var(--weight-medium)',
      letterSpacing: 'var(--track-display)',
      maxWidth: 700
    }
  }, "Fem faser. Ingen dubbelregistrering."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--size-lg)',
      color: 'var(--text-secondary)',
      maxWidth: 'var(--prose-max)',
      marginTop: 'var(--space-6)',
      lineHeight: 'var(--lh-relaxed)'
    }
  }, "Uppgiften f\xF6ljer projektet hela v\xE4gen. Det som m\xE4tts p\xE5 plats \xE4r samma data som hamnar p\xE5 fakturan."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--space-10)'
    }
  }, /*#__PURE__*/React.createElement(PhaseChain, {
    current: i,
    onSelect: n => setI(n),
    phases: STEG.map(s => ({
      label: s.titel
    }))
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 'var(--space-9)',
      marginTop: 'var(--space-10)',
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Icon, {
    name: STEG[i].icon,
    size: 24
  }), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 'var(--size-2xl)',
      fontWeight: 'var(--weight-medium)',
      letterSpacing: 'var(--track-heading)',
      marginTop: 'var(--space-6)'
    }
  }, STEG[i].titel), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--size-md)',
      color: 'var(--text-secondary)',
      lineHeight: 'var(--lh-relaxed)',
      marginTop: 'var(--space-5)',
      maxWidth: 460
    }
  }, STEG[i].text), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--space-8)'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    iconAfter: "arrow-right"
  }, "L\xE4s mer om ", STEG[i].titel.toLowerCase()))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--bg-sunken)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-sheet)',
      height: 320,
      display: 'flex',
      alignItems: 'flex-end',
      padding: 'var(--space-8)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--size-2xs)',
      color: 'var(--text-tertiary)'
    }
  }, "[ bildplats: sk\xE4rmbild av ", STEG[i].titel.toLowerCase(), " ]"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 'var(--space-6)',
      marginTop: 'var(--space-12)'
    }
  }, [['truck', 'Tillgångar och underhåll', 'Fordon, instrument och verktyg med kalibreringsdatum och planerat underhåll.'], ['smartphone', 'Byggd för fältet', '44 px träffytor, offlinetålig tidrapport och kamera för avvikelser.'], ['plug', 'Kopplat till din ekonomi', 'Export till Fortnox och Visma. Ingen manuell överföring av underlag.']].map(([ic, t, txt]) => /*#__PURE__*/React.createElement(Card, {
    key: t
  }, /*#__PURE__*/React.createElement(Icon, {
    name: ic,
    size: 20
  }), /*#__PURE__*/React.createElement("h4", {
    style: {
      fontSize: 'var(--size-lg)',
      fontWeight: 'var(--weight-medium)',
      marginTop: 'var(--space-6)'
    }
  }, t), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--size-xs)',
      color: 'var(--text-secondary)',
      lineHeight: 'var(--lh-normal)',
      marginTop: 'var(--space-4)'
    }
  }, txt)))));
}
Object.assign(window, {
  Chain
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/site/Chain.jsx", error: String((e && e.message) || e) }); }

// ui_kits/site/Footer.jsx
try { (() => {
const {
  Button,
  Input,
  Divider,
  Icon
} = window.KopplaDesignSystem_4b46f2;
function SiteFooter() {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("section", {
    "data-theme": "inverse",
    style: {
      background: 'var(--bg-page)',
      padding: 'var(--space-13) var(--gutter-page)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--page-max)',
      margin: '0 auto',
      display: 'grid',
      gridTemplateColumns: '1.2fr 1fr',
      gap: 'var(--space-11)',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 'var(--size-4xl)',
      fontWeight: 'var(--weight-medium)',
      letterSpacing: 'var(--track-display)',
      color: 'var(--text-primary)'
    }
  }, "Se det p\xE5 ditt eget projekt."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--size-md)',
      color: 'var(--text-secondary)',
      marginTop: 'var(--space-6)',
      maxWidth: 480,
      lineHeight: 'var(--lh-relaxed)'
    }
  }, "30 minuter, en av dina egna entreprenader. Vi visar kedjan fr\xE5n platsbes\xF6k till faktura.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 'var(--space-5)'
    }
  }, /*#__PURE__*/React.createElement(Input, {
    size: "lg",
    placeholder: "Namn och f\xF6retag"
  }), /*#__PURE__*/React.createElement(Input, {
    size: "lg",
    placeholder: "E-post",
    icon: "mail"
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    fullWidth: true
  }, "Boka demo"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--size-2xs)',
      color: 'var(--text-tertiary)'
    }
  }, "Vi h\xF6r av oss inom en arbetsdag.")))), /*#__PURE__*/React.createElement("footer", {
    style: {
      padding: 'var(--space-10) var(--gutter-page) var(--space-9)',
      borderTop: '1px solid var(--border-default)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--page-max)',
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1.4fr 1fr 1fr 1fr',
      gap: 'var(--space-9)'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      background: 'var(--signal-400)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--size-lg)',
      fontWeight: 'var(--weight-medium)',
      letterSpacing: '-0.03em'
    }
  }, "Kopplas")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--size-2xs)',
      color: 'var(--text-tertiary)',
      marginTop: 'var(--space-5)',
      maxWidth: 260
    }
  }, "Verksamhetssystem f\xF6r elektriker. Byggt i Sverige.")), [['Produkt', ['Kedjan', 'Tidrapport', 'Egenkontroll', 'Tillgångar']], ['Företag', ['Om oss', 'Jobb', 'Kontakt']], ['Övrigt', ['Support', 'Driftstatus', 'Villkor']]].map(([t, items]) => /*#__PURE__*/React.createElement("div", {
    key: t
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--size-3xs)',
      letterSpacing: 'var(--track-caps)',
      textTransform: 'uppercase',
      color: 'var(--text-tertiary)'
    }
  }, t), /*#__PURE__*/React.createElement("ul", {
    style: {
      listStyle: 'none',
      margin: 'var(--space-6) 0 0',
      padding: 0,
      display: 'grid',
      gap: 'var(--space-4)'
    }
  }, items.map(x => /*#__PURE__*/React.createElement("li", {
    key: x
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: {
      fontSize: 'var(--size-2xs)',
      color: 'var(--text-secondary)',
      border: 0
    }
  }, x))))))), /*#__PURE__*/React.createElement(Divider, {
    style: {
      margin: 'var(--space-9) 0 var(--space-6)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: 'var(--size-3xs)',
      color: 'var(--text-tertiary)'
    }
  }, /*#__PURE__*/React.createElement("span", null, "\xA9 2026 Kopplas AB"), /*#__PURE__*/React.createElement("span", null, "Malm\xF6 \xB7 Stockholm")))));
}
Object.assign(window, {
  SiteFooter
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/site/Footer.jsx", error: String((e && e.message) || e) }); }

// ui_kits/site/Hero.jsx
try { (() => {
const {
  Button,
  Icon,
  Metric
} = window.KopplaDesignSystem_4b46f2;
function Hero({
  onNav
}) {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      padding: 'var(--space-14) var(--gutter-page) var(--space-12)',
      maxWidth: 'var(--page-max)',
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--size-3xs)',
      letterSpacing: 'var(--track-caps)',
      textTransform: 'uppercase',
      color: 'var(--text-tertiary)'
    }
  }, "Verksamhetssystem f\xF6r elektriker"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 'clamp(52px, 7.4vw, 104px)',
      fontWeight: 'var(--weight-medium)',
      letterSpacing: 'var(--track-display)',
      lineHeight: 'var(--lh-tight)',
      marginTop: 'var(--space-7)',
      maxWidth: 900,
      textWrap: 'pretty'
    }
  }, "Hela kedjan.", /*#__PURE__*/React.createElement("br", null), "Ett system."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--size-lg)',
      lineHeight: 'var(--lh-relaxed)',
      color: 'var(--text-secondary)',
      maxWidth: 'var(--prose-max)',
      marginTop: 'var(--space-8)'
    }
  }, "Fr\xE5n f\xF6rsta platsbes\xF6ket till sista fakturan. Prospektering, projektering, genomf\xF6rande, dokumentation och fakturering \u2014 samma uppgifter, en g\xE5ng inmatade."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-5)',
      marginTop: 'var(--space-9)'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    onClick: () => onNav('demo')
  }, "Boka demo"), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "lg",
    iconAfter: "arrow-right",
    onClick: () => onNav('kedjan')
  }, "Se kedjan")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--space-13)',
      height: 420,
      borderRadius: 'var(--radius-sheet)',
      overflow: 'hidden',
      background: 'linear-gradient(to top, rgb(13 13 15 / .55), rgb(13 13 15 / 0) 60%), var(--n-200)',
      display: 'flex',
      alignItems: 'flex-end',
      padding: 'var(--space-9)'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--size-2xl)',
      fontWeight: 'var(--weight-medium)',
      letterSpacing: 'var(--track-heading)',
      color: 'var(--n-000)'
    }
  }, "Elpro Syd AB, 34 mont\xF6rer"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--size-xs)',
      color: 'var(--n-150)',
      marginTop: 'var(--space-3)',
      fontFamily: 'var(--font-mono)'
    }
  }, "[ bildplats: st\xE4llverk i arbetsljus, kall och dokument\xE4r ]"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 'var(--space-9)',
      marginTop: 'var(--space-11)',
      borderTop: '1px solid var(--border-default)',
      paddingTop: 'var(--space-9)'
    }
  }, /*#__PURE__*/React.createElement(Metric, {
    label: "Mindre tid p\xE5 administration",
    value: "6 h",
    unit: "/ vecka"
  }), /*#__PURE__*/React.createElement(Metric, {
    label: "Snabbare fakturering",
    value: "9 dagar"
  }), /*#__PURE__*/React.createElement(Metric, {
    label: "Fullst\xE4ndig egenkontroll",
    value: "100 %"
  })));
}
Object.assign(window, {
  Hero
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/site/Hero.jsx", error: String((e && e.message) || e) }); }

// ui_kits/site/Pricing.jsx
try { (() => {
const {
  Card,
  Button,
  Badge,
  Icon,
  Divider,
  SegmentedControl
} = window.KopplaDesignSystem_4b46f2;
const PLANER = [{
  namn: 'Verkstad',
  pris: '390',
  beskrivning: 'För firmor upp till 10 montörer.',
  punkter: ['Anbud och projekt', 'Tidrapport i mobil', 'Egenkontroll', 'Fakturaunderlag']
}, {
  namn: 'Entreprenad',
  pris: '590',
  beskrivning: 'För firmor med flera projektledare.',
  punkter: ['Allt i Verkstad', 'ÄTA och betalplaner', 'Tillgångar och underhåll', 'Ekonomiintegration', 'Attestflöden'],
  vald: true
}, {
  namn: 'Koncern',
  pris: 'Offert',
  beskrivning: 'Flera bolag, egna processer.',
  punkter: ['Allt i Entreprenad', 'Flera bolag', 'SSO och behörighetsstyrning', 'Egen införandeledare']
}];
function Pricing() {
  const [period, setPeriod] = React.useState('Per månad');
  return /*#__PURE__*/React.createElement("section", {
    style: {
      padding: 'var(--space-13) var(--gutter-page)',
      maxWidth: 'var(--page-max)',
      margin: '0 auto',
      borderTop: '1px solid var(--border-default)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 'var(--space-9)',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 'var(--size-4xl)',
      fontWeight: 'var(--weight-medium)',
      letterSpacing: 'var(--track-display)'
    }
  }, "Pris per anv\xE4ndare"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--size-md)',
      color: 'var(--text-secondary)',
      marginTop: 'var(--space-5)'
    }
  }, "Inga startavgifter. Ingen bindningstid ut\xF6ver perioden.")), /*#__PURE__*/React.createElement(SegmentedControl, {
    options: ['Per månad', 'Per år'],
    value: period,
    onChange: setPeriod
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 'var(--space-6)',
      marginTop: 'var(--space-10)',
      alignItems: 'stretch'
    }
  }, PLANER.map(p => /*#__PURE__*/React.createElement("div", {
    key: p.namn,
    style: {
      background: p.vald ? 'var(--n-950)' : 'var(--surface-card)',
      border: '1px solid ' + (p.vald ? 'var(--n-950)' : 'var(--surface-card-border)'),
      borderRadius: 'var(--radius-card)',
      padding: 'var(--space-9)',
      display: 'flex',
      flexDirection: 'column'
    },
    "data-theme": p.vald ? 'inverse' : undefined
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-5)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--size-lg)',
      fontWeight: 'var(--weight-medium)',
      color: 'var(--text-primary)'
    }
  }, p.namn), p.vald ? /*#__PURE__*/React.createElement(Badge, {
    tone: "signal"
  }, "Vanligast") : null), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 'var(--space-4)',
      marginTop: 'var(--space-7)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--size-4xl)',
      fontWeight: 'var(--weight-semibold)',
      letterSpacing: '-0.03em',
      fontVariantNumeric: 'tabular-nums',
      color: 'var(--text-primary)'
    }
  }, p.pris), p.pris === 'Offert' ? null : /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--size-sm)',
      color: 'var(--text-secondary)'
    }
  }, "kr / anv\xE4ndare / m\xE5n")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--size-xs)',
      color: 'var(--text-secondary)',
      marginTop: 'var(--space-5)'
    }
  }, p.beskrivning), /*#__PURE__*/React.createElement(Divider, {
    style: {
      margin: 'var(--space-8) 0'
    }
  }), /*#__PURE__*/React.createElement("ul", {
    style: {
      listStyle: 'none',
      margin: 0,
      padding: 0,
      display: 'grid',
      gap: 'var(--space-5)'
    }
  }, p.punkter.map(x => /*#__PURE__*/React.createElement("li", {
    key: x,
    style: {
      display: 'flex',
      gap: 'var(--space-4)',
      fontSize: 'var(--size-xs)',
      color: 'var(--text-primary)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 14,
    style: {
      color: 'var(--text-tertiary)',
      marginTop: 2
    }
  }), x))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'auto',
      paddingTop: 'var(--space-9)'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    fullWidth: true,
    variant: p.vald ? 'primary' : 'secondary'
  }, p.pris === 'Offert' ? 'Kontakta oss' : 'Boka demo'))))));
}
Object.assign(window, {
  Pricing
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/site/Pricing.jsx", error: String((e && e.message) || e) }); }

// ui_kits/site/SiteHeader.jsx
try { (() => {
const {
  Button,
  Icon
} = window.KopplaDesignSystem_4b46f2;
function SiteHeader({
  onNav,
  active
}) {
  const links = [['produkt', 'Produkt'], ['kedjan', 'Kedjan'], ['priser', 'Priser'], ['kunder', 'Kunder']];
  return /*#__PURE__*/React.createElement("header", {
    style: {
      position: 'sticky',
      top: 0,
      zIndex: 30,
      height: 64,
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-9)',
      padding: '0 var(--gutter-page)',
      background: 'var(--bg-glass)',
      backdropFilter: 'var(--blur-glass)',
      WebkitBackdropFilter: 'var(--blur-glass)',
      borderBottom: '1px solid var(--border-default)'
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      onNav('produkt');
    },
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--space-4)',
      border: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      background: 'var(--signal-400)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--size-lg)',
      fontWeight: 'var(--weight-medium)',
      letterSpacing: '-0.03em'
    }
  }, "Kopplas")), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      gap: 'var(--space-8)',
      marginLeft: 'var(--space-8)'
    }
  }, links.map(([k, l]) => /*#__PURE__*/React.createElement("a", {
    key: k,
    href: '#' + k,
    onClick: e => {
      e.preventDefault();
      onNav(k);
    },
    style: {
      fontSize: 'var(--size-xs)',
      border: 0,
      color: active === k ? 'var(--text-primary)' : 'var(--text-secondary)'
    }
  }, l))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: 'auto',
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-5)'
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: {
      fontSize: 'var(--size-xs)',
      color: 'var(--text-secondary)',
      border: 0
    }
  }, "Logga in"), /*#__PURE__*/React.createElement(Button, {
    variant: "signal",
    size: "md",
    onClick: () => onNav('demo')
  }, "Boka demo")));
}
Object.assign(window, {
  SiteHeader
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/site/SiteHeader.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Divider = __ds_scope.Divider;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Metric = __ds_scope.Metric;

__ds_ns.StatusDot = __ds_scope.StatusDot;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.Toolbar = __ds_scope.Toolbar;

__ds_ns.EmptyState = __ds_scope.EmptyState;

__ds_ns.PhaseChain = __ds_scope.PhaseChain;

__ds_ns.ProgressBar = __ds_scope.ProgressBar;

__ds_ns.Table = __ds_scope.Table;

__ds_ns.Timeline = __ds_scope.Timeline;

__ds_ns.Banner = __ds_scope.Banner;

__ds_ns.Modal = __ds_scope.Modal;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.Tooltip = __ds_scope.Tooltip;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Field = __ds_scope.Field;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Radio = __ds_scope.Radio;

__ds_ns.SegmentedControl = __ds_scope.SegmentedControl;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.Textarea = __ds_scope.Textarea;

__ds_ns.Breadcrumbs = __ds_scope.Breadcrumbs;

__ds_ns.SidebarNav = __ds_scope.SidebarNav;

__ds_ns.Tabs = __ds_scope.Tabs;

__ds_ns.TopBar = __ds_scope.TopBar;

})();
