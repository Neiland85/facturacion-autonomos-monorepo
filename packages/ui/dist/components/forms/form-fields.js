"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormField = FormField;
exports.TextAreaField = TextAreaField;
exports.SelectField = SelectField;
exports.CheckboxField = CheckboxField;
exports.RadioField = RadioField;
var framer_motion_1 = require("framer-motion");
var checkbox_1 = require("../ui/checkbox");
var input_1 = require("../ui/input");
var label_1 = require("../ui/label");
var radio_group_1 = require("../ui/radio-group");
var select_1 = require("../ui/select");
var textarea_1 = require("../ui/textarea");
function FormField(_a) {
    var name = _a.name, label = _a.label, _b = _a.type, type = _b === void 0 ? "text" : _b, placeholder = _a.placeholder, required = _a.required, disabled = _a.disabled, error = _a.error, value = _a.value, onChange = _a.onChange, _c = _a.className, className = _c === void 0 ? "" : _c;
    return (<div className={"space-y-2 ".concat(className)}>
      <label_1.Label htmlFor={name} className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label_1.Label>
      <input_1.Input id={name} name={name} type={type} placeholder={placeholder} value={value} onChange={function (e) { return onChange === null || onChange === void 0 ? void 0 : onChange(e.target.value); }} disabled={disabled} className={error ? "border-red-500 focus:border-red-500" : ""}/>
      <framer_motion_1.AnimatePresence>
        {error && (<framer_motion_1.motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-sm text-red-600">
            {error}
          </framer_motion_1.motion.p>)}
      </framer_motion_1.AnimatePresence>
    </div>);
}
function TextAreaField(_a) {
    var name = _a.name, label = _a.label, placeholder = _a.placeholder, required = _a.required, disabled = _a.disabled, error = _a.error, value = _a.value, onChange = _a.onChange, _b = _a.rows, rows = _b === void 0 ? 3 : _b, _c = _a.className, className = _c === void 0 ? "" : _c;
    return (<div className={"space-y-2 ".concat(className)}>
      <label_1.Label htmlFor={name} className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label_1.Label>
      <textarea_1.Textarea id={name} name={name} placeholder={placeholder} value={value} onChange={function (e) { return onChange === null || onChange === void 0 ? void 0 : onChange(e.target.value); }} disabled={disabled} rows={rows} className={error ? "border-red-500 focus:border-red-500" : ""}/>
      <framer_motion_1.AnimatePresence>
        {error && (<framer_motion_1.motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-sm text-red-600">
            {error}
          </framer_motion_1.motion.p>)}
      </framer_motion_1.AnimatePresence>
    </div>);
}
function SelectField(_a) {
    var name = _a.name, label = _a.label, placeholder = _a.placeholder, required = _a.required, disabled = _a.disabled, error = _a.error, value = _a.value, onChange = _a.onChange, options = _a.options, _b = _a.className, className = _b === void 0 ? "" : _b;
    return (<div className={"space-y-2 ".concat(className)}>
      <label_1.Label htmlFor={name} className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label_1.Label>
      <select_1.Select value={value} onValueChange={onChange} disabled={disabled}>
        <select_1.SelectTrigger className={error ? "border-red-500 focus:border-red-500" : ""}>
          <select_1.SelectValue placeholder={placeholder}/>
        </select_1.SelectTrigger>
        <select_1.SelectContent>
          {options.map(function (option) { return (<select_1.SelectItem key={option.value} value={option.value}>
              {option.label}
            </select_1.SelectItem>); })}
        </select_1.SelectContent>
      </select_1.Select>
      <framer_motion_1.AnimatePresence>
        {error && (<framer_motion_1.motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-sm text-red-600">
            {error}
          </framer_motion_1.motion.p>)}
      </framer_motion_1.AnimatePresence>
    </div>);
}
function CheckboxField(_a) {
    var name = _a.name, label = _a.label, description = _a.description, checked = _a.checked, onChange = _a.onChange, disabled = _a.disabled, _b = _a.className, className = _b === void 0 ? "" : _b;
    return (<div className={"flex items-start space-x-3 ".concat(className)}>
      <checkbox_1.Checkbox id={name} name={name} checked={checked} onCheckedChange={onChange} disabled={disabled} className="mt-0.5"/>
      <div className="space-y-1">
        <label_1.Label htmlFor={name} className="text-sm font-medium cursor-pointer">
          {label}
        </label_1.Label>
        {description && (<p className="text-sm text-muted-foreground">{description}</p>)}
      </div>
    </div>);
}
function RadioField(_a) {
    var name = _a.name, label = _a.label, value = _a.value, onChange = _a.onChange, options = _a.options, disabled = _a.disabled, _b = _a.className, className = _b === void 0 ? "" : _b;
    return (<div className={"space-y-3 ".concat(className)}>
      <label_1.Label className="text-sm font-medium">{label}</label_1.Label>
      <radio_group_1.RadioGroup value={value} onValueChange={onChange} disabled={disabled}>
        {options.map(function (option) { return (<div key={option.value} className="flex items-start space-x-3">
            <radio_group_1.RadioGroupItem value={option.value} id={"".concat(name, "-").concat(option.value)} className="mt-0.5"/>
            <div className="space-y-1">
              <label_1.Label htmlFor={"".concat(name, "-").concat(option.value)} className="text-sm font-medium cursor-pointer">
                {option.label}
              </label_1.Label>
              {option.description && (<p className="text-sm text-muted-foreground">
                  {option.description}
                </p>)}
            </div>
          </div>); })}
      </radio_group_1.RadioGroup>
    </div>);
}
