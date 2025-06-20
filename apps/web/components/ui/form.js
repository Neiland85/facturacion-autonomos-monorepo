"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormField = exports.FormMessage = exports.FormDescription = exports.FormControl = exports.FormLabel = exports.FormItem = exports.Form = exports.useFormField = void 0;
const React = require("react");
const react_slot_1 = require("@radix-ui/react-slot");
const react_hook_form_1 = require("react-hook-form");
const utils_1 = require("@/lib/utils");
const label_1 = require("@/components/ui/label");
const Form = react_hook_form_1.FormProvider;
exports.Form = Form;
const FormFieldContext = React.createContext({});
const FormField = ({ ...props }) => {
    return (<FormFieldContext.Provider value={{ name: props.name }}>
      <react_hook_form_1.Controller {...props}/>
    </FormFieldContext.Provider>);
};
exports.FormField = FormField;
const useFormField = () => {
    const fieldContext = React.useContext(FormFieldContext);
    const itemContext = React.useContext(FormItemContext);
    const { getFieldState, formState } = (0, react_hook_form_1.useFormContext)();
    const fieldState = getFieldState(fieldContext.name, formState);
    if (!fieldContext) {
        throw new Error("useFormField should be used within <FormField>");
    }
    const { id } = itemContext;
    return {
        id,
        name: fieldContext.name,
        formItemId: `${id}-form-item`,
        formDescriptionId: `${id}-form-item-description`,
        formMessageId: `${id}-form-item-message`,
        ...fieldState,
    };
};
exports.useFormField = useFormField;
const FormItemContext = React.createContext({});
const FormItem = React.forwardRef(({ className, ...props }, ref) => {
    const id = React.useId();
    return (<FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={(0, utils_1.cn)("space-y-2", className)} {...props}/>
    </FormItemContext.Provider>);
});
exports.FormItem = FormItem;
FormItem.displayName = "FormItem";
const FormLabel = React.forwardRef(({ className, ...props }, ref) => {
    const { error, formItemId } = useFormField();
    return (<label_1.Label ref={ref} className={(0, utils_1.cn)(error && "text-destructive", className)} htmlFor={formItemId} {...props}/>);
});
exports.FormLabel = FormLabel;
FormLabel.displayName = "FormLabel";
const FormControl = React.forwardRef(({ ...props }, ref) => {
    const { error, formItemId, formDescriptionId, formMessageId } = useFormField();
    return (<react_slot_1.Slot ref={ref} id={formItemId} aria-describedby={!error
            ? `${formDescriptionId}`
            : `${formDescriptionId} ${formMessageId}`} aria-invalid={!!error} {...props}/>);
});
exports.FormControl = FormControl;
FormControl.displayName = "FormControl";
const FormDescription = React.forwardRef(({ className, ...props }, ref) => {
    const { formDescriptionId } = useFormField();
    return (<p ref={ref} id={formDescriptionId} className={(0, utils_1.cn)("text-sm text-muted-foreground", className)} {...props}/>);
});
exports.FormDescription = FormDescription;
FormDescription.displayName = "FormDescription";
const FormMessage = React.forwardRef(({ className, children, ...props }, ref) => {
    const { error, formMessageId } = useFormField();
    const body = error ? String(error?.message) : children;
    if (!body) {
        return null;
    }
    return (<p ref={ref} id={formMessageId} className={(0, utils_1.cn)("text-sm font-medium text-destructive", className)} {...props}>
      {body}
    </p>);
});
exports.FormMessage = FormMessage;
FormMessage.displayName = "FormMessage";
