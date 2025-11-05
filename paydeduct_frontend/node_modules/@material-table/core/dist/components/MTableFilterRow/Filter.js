"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _typeof = require("@babel/runtime/helpers/typeof");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function _interopRequireWildcard(e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, "default": e }; if (null === e || "object" != _typeof(e) && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (var _t in e) "default" !== _t && {}.hasOwnProperty.call(e, _t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, _t)) && (i.get || i.set) ? o(f, _t, i) : f[_t] = e[_t]); return f; })(e, t); }
function Filter(_ref) {
  var columnDef = _ref.columnDef,
    onFilterChanged = _ref.onFilterChanged,
    forwardedRef = _ref.forwardedRef;
  return /*#__PURE__*/(0, _react.createElement)(columnDef.filterComponent, {
    columnDef: columnDef,
    onFilterChanged: onFilterChanged,
    forwardedRef: forwardedRef
  });
}
var _default = exports["default"] = /*#__PURE__*/_react["default"].forwardRef(function FilterRef(props, ref) {
  return /*#__PURE__*/_react["default"].createElement(Filter, (0, _extends2["default"])({}, props, {
    forwardedRef: ref
  }));
});