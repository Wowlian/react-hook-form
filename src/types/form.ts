import React from 'react';

import { Subject, Subscription } from '../utils/createSubject';

import { ErrorOption, FieldError, FieldErrors } from './errors';
import { EventType } from './events';
import { FieldArray } from './fieldArray';
import {
  FieldRefs,
  FieldValue,
  FieldValues,
  InternalFieldName,
} from './fields';
import {
  Auto,
  Branded,
  FieldPathSetValue,
  FieldPathValue,
  FieldPathValues,
  PathString,
} from './path';
import { Resolver } from './resolvers';
import { DeepMap, DeepPartial, Noop } from './utils';
import { RegisterOptions } from './validator';

export type InternalNameSet = Set<InternalFieldName>;

export type ValidationMode = {
  onBlur: 'onBlur';
  onChange: 'onChange';
  onSubmit: 'onSubmit';
  onTouched: 'onTouched';
  all: 'all';
};

export type Mode = keyof ValidationMode;

export type CriteriaMode = 'firstError' | 'all';

export type SubmitHandler<TFieldValues extends FieldValues> = (
  data: Readonly<TFieldValues>,
  event?: React.BaseSyntheticEvent,
) => any | Promise<any>;

export type SubmitErrorHandler<TFieldValues extends FieldValues> = (
  errors: Readonly<FieldErrors<TFieldValues>>,
  event?: React.BaseSyntheticEvent,
) => any | Promise<any>;

export type SetValueOptions = Partial<{
  shouldValidate: boolean;
  shouldDirty: boolean;
  shouldTouch: boolean;
}>;

export type TriggerOptions = Partial<{
  shouldFocus: boolean;
}>;

export type ChangeHandler = (event: {
  target: any;
  type?: any;
}) => Promise<void | boolean>;

export type DelayCallback = (
  name: InternalFieldName,
  error: FieldError,
) => void;

export type UseFormProps<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
> = Partial<{
  mode: Mode;
  reValidateMode: Exclude<Mode, 'onTouched' | 'all'>;
  defaultValues: TFieldValues;
  resolver: Resolver<TFieldValues, TContext>;
  context: TContext;
  shouldFocusError: boolean;
  shouldUnregister: boolean;
  shouldUseNativeValidation: boolean;
  criteriaMode: CriteriaMode;
  delayError: number;
}>;

export type FieldNamesMarkedBoolean<TFieldValues extends FieldValues> = DeepMap<
  DeepPartial<TFieldValues>,
  boolean
>;

export type FormStateProxy<TFieldValues extends FieldValues = FieldValues> = {
  isDirty: boolean;
  isValidating: boolean;
  dirtyFields: FieldNamesMarkedBoolean<TFieldValues>;
  touchedFields: FieldNamesMarkedBoolean<TFieldValues>;
  errors: boolean;
  isValid: boolean;
};

export type ReadFormState = { [K in keyof FormStateProxy]: boolean | 'all' };

export type FormState<TFieldValues> = {
  isDirty: boolean;
  dirtyFields: FieldNamesMarkedBoolean<TFieldValues>;
  isSubmitted: boolean;
  isSubmitSuccessful: boolean;
  submitCount: number;
  touchedFields: FieldNamesMarkedBoolean<TFieldValues>;
  isSubmitting: boolean;
  isValidating: boolean;
  isValid: boolean;
  errors: FieldErrors<TFieldValues>;
};

export type KeepStateOptions = Partial<{
  keepErrors: boolean;
  keepDirty: boolean;
  keepValues: boolean;
  keepDefaultValues: boolean;
  keepIsSubmitted: boolean;
  keepTouched: boolean;
  keepSubmitCount: boolean;
}>;

export type SetFieldValue<TFieldValues> = FieldValue<TFieldValues>;

export type RefCallBack = (instance: any) => void;

export type UseFormRegisterReturn = {
  onChange: ChangeHandler;
  onBlur: ChangeHandler;
  ref: RefCallBack;
  name: InternalFieldName;
  min?: string | number;
  max?: string | number;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  required?: boolean;
  disabled?: boolean;
};

/**
 * Register field into hook form with or without the actual DOM ref. You can invoke register anywhere in the component including at `useEffect`.
 *
 * @remarks
 * [API](https://react-hook-form.com/api/useform/register) • [Demo](https://codesandbox.io/s/react-hook-form-register-ts-ip2j3) • [Video](https://www.youtube.com/watch?v=JFIpCoajYkA)
 *
 * @param name - the path name to the form field value, name is required and unique
 * @param options - register options include validation, disabled, unregister, value as and dependent validation
 *
 * @returns onChange, onBlur, name, ref, and native contribute attribute if browser validation is enabled.
 *
 * @example
 * ```tsx
 * // Register HTML native input
 * <input {...register("input")} />
 * <select {...register("select")} />
 *
 * // Register options
 * <textarea {...register("textarea", { required: "This is required.", maxLength: 20 })} />
 * <input type="number" {...register("name2", { valueAsNumber: true })} />
 * <input {...register("name3", { deps: ["name2"] })} />
 *
 * // Register custom field at useEffect
 * useEffect(() => {
 *   register("name4");
 *   register("name5", { value: '"hiddenValue" });
 * }, [register])
 *
 * // Register without ref
 * const { onChange, onBlur, name } = register("name6")
 * <input onChange={onChange} onBlur={onBlur} name={name} />
 * ```
 */
export type UseFormRegister<TFieldValues extends FieldValues> = <
  TFieldName extends PathString,
>(
  name: Auto.FieldPath<TFieldValues, TFieldName>,
  options?: RegisterOptions<TFieldValues, TFieldName>,
) => UseFormRegisterReturn;

export type SetFocusOptions = Partial<{
  shouldSelect: boolean;
}>;

/**
 * Set focus on a registered field. You can start to invoke this method after all fields are mounted to the DOM.
 *
 * @remarks
 * [API](https://react-hook-form.com/api/useform/setfocus) • [Demo](https://codesandbox.io/s/setfocus-rolus)
 *
 * @param name - the path name to the form field value.
 * @param options - input focus behavior options
 *
 * @example
 * ```tsx
 * useEffect(() => {
 *   setFocus("name");
 * }, [setFocus])
 * // shouldSelect allows to select input's content on focus
 * <button onClick={() => setFocus("name", { shouldSelect: true })}>Focus</button>
 * ```
 */
export type UseFormSetFocus<TFieldValues extends FieldValues> = <
  TFieldName extends PathString,
>(
  name: Auto.FieldPath<TFieldValues, TFieldName>,
  options?: SetFocusOptions,
) => void;

export type UseFormGetValues<TFieldValues extends FieldValues> = {
  /**
   * Get the entire form values when no argument is supplied to this function.
   *
   * @remarks
   * [API](https://react-hook-form.com/api/useform/getvalues) • [Demo](https://codesandbox.io/s/react-hook-form-v7-ts-getvalues-txsfg)
   *
   * @returns form values
   *
   * @example
   * ```tsx
   * <button onClick={() => getValues()}>getValues</button>
   *
   * <input {...register("name", {
   *   validate: () => getValues().otherField === "test";
   * })} />
   * ```
   */
  (): TFieldValues;
  /**
   * Get a single field value.
   *
   * @remarks
   * [API](https://react-hook-form.com/api/useform/getvalues) • [Demo](https://codesandbox.io/s/react-hook-form-v7-ts-getvalues-txsfg)
   *
   * @param name - the path name to the form field value.
   *
   * @returns the single field value
   *
   * @example
   * ```tsx
   * <button onClick={() => getValues("name")}>getValues</button>
   *
   * <input {...register("name", {
   *   validate: () => getValues('otherField') === "test";
   * })} />
   * ```
   */
  <TFieldName extends PathString>(
    name: Auto.FieldPath<TFieldValues, TFieldName>,
  ): FieldPathValue<TFieldValues, TFieldName>;
  /**
   * Get an array of field values.
   *
   * @remarks
   * [API](https://react-hook-form.com/api/useform/getvalues) • [Demo](https://codesandbox.io/s/react-hook-form-v7-ts-getvalues-txsfg)
   *
   * @param names - an array of field names
   *
   * @returns An array of field values
   *
   * @example
   * ```tsx
   * <button onClick={() => getValues(["name", "name1"])}>getValues</button>
   *
   * <input {...register("name", {
   *   validate: () => getValues(["fieldA", "fieldB"]).includes("test");
   * })} />
   * ```
   */
  <TFieldNames extends PathString[]>(
    names: readonly [...Auto.FieldPaths<TFieldValues, TFieldNames>],
  ): [...FieldPathValues<TFieldValues, TFieldNames>];
};

/**
 * This method will return individual field states. It will be useful when you are trying to retrieve the nested value field state in a typesafe approach.
 *
 * @remarks
 * [API](https://react-hook-form.com/api/useform/getfieldstate) • [Demo](https://codesandbox.io/s/getfieldstate-jvekk)
 *
 * @param name - the path name to the form field value.
 *
 * @returns invalid, isDirty, isTouched and error object
 *
 * @example
 * ```tsx
 * // those formState has to be subscribed
 * const { formState: { dirtyFields, errors, touchedFields } } = formState();
 * getFieldState('name')
 * // Get field state when form state is not subscribed yet
 * getFieldState('name', formState)
 *
 * // It's ok to combine with useFormState
 * const formState = useFormState();
 * getFieldState('name')
 * getFieldState('name', formState)
 * ```
 */
export type UseFormGetFieldState<TFieldValues extends FieldValues> = <
  TFieldName extends PathString,
>(
  name: Auto.FieldPath<TFieldValues, TFieldName>,
  formState?: FormState<TFieldValues>,
) => {
  invalid: boolean;
  isDirty: boolean;
  isTouched: boolean;
  error?: FieldError;
};

export type UseFormWatch<TFieldValues extends FieldValues> = {
  /**
   * Watch and subscribe to the entire form update/change based on onChange and re-render at the useForm.
   *
   * @remarks
   * [API](https://react-hook-form.com/api/useform/watch) • [Demo](https://codesandbox.io/s/react-hook-form-watch-v7-ts-8et1d) • [Video](https://www.youtube.com/watch?v=3qLd69WMqKk)
   *
   * @returns return the entire form values
   *
   * @example
   * ```tsx
   * const formValues = watch();
   * ```
   */
  (): TFieldValues;
  /**
   * Watch and subscribe to an array of fields used outside of render.
   *
   * @remarks
   * [API](https://react-hook-form.com/api/useform/watch) • [Demo](https://codesandbox.io/s/react-hook-form-watch-v7-ts-8et1d) • [Video](https://www.youtube.com/watch?v=3qLd69WMqKk)
   *
   * @param names - an array of field names
   * @param defaultValue - defaultValues for the entire form
   *
   * @returns return an array of field values
   *
   * @example
   * ```tsx
   * const [name, name1] = watch(["name", "name1"]);
   * ```
   */
  <TFieldNames extends PathString[]>(
    names: readonly [...Auto.FieldPaths<TFieldValues, TFieldNames>],
    defaultValue?: DeepPartial<TFieldValues>,
  ): FieldPathValues<TFieldValues, TFieldNames>;
  /**
   * Watch a single field update and used it outside of render.
   *
   * @remarks
   * [API](https://react-hook-form.com/api/useform/watch) • [Demo](https://codesandbox.io/s/react-hook-form-watch-v7-ts-8et1d) • [Video](https://www.youtube.com/watch?v=3qLd69WMqKk)
   *
   * @param name - the path name to the form field value.
   * @param defaultValue - defaultValues for the entire form
   *
   * @returns return the single field value
   *
   * @example
   * ```tsx
   * const name = watch("name");
   * ```
   */
  <TFieldName extends PathString>(
    name: Auto.FieldPath<TFieldValues, TFieldName>,
    defaultValue?: FieldPathValue<TFieldValues, TFieldName>,
  ): FieldPathValue<TFieldValues, TFieldName>;
  /**
   * Subscribe to field update/change without trigger re-render
   *
   * @remarks
   * [API](https://react-hook-form.com/api/useform/watch) • [Demo](https://codesandbox.io/s/react-hook-form-watch-v7-ts-8et1d) • [Video](https://www.youtube.com/watch?v=3qLd69WMqKk)
   *
   * @param callback - call back function to subscribe all fields change and return unsubscribe function
   * @param defaultValues - defaultValues for the entire form
   *
   * @returns unsubscribe function
   *
   * @example
   * ```tsx
   * useEffect(() => {
   *   const unsubscribe = watch((value) => {
   *     console.log(value);
   *   });
   *   return () => unsubscribe();
   * }, [watch])
   * ```
   */
  (
    callback: WatchObserver<TFieldValues>,
    defaultValues?: DeepPartial<TFieldValues>,
  ): Subscription;
};

/**
 * Trigger field or form validation
 *
 * @remarks
 * [API](https://react-hook-form.com/api/useform/trigger) • [Demo](https://codesandbox.io/s/react-hook-form-v7-ts-triggervalidation-forked-xs7hl) • [Video](https://www.youtube.com/watch?v=-bcyJCDjksE)
 *
 * @param name - provide empty argument will trigger the entire form validation, an array of field names will validate an arrange of fields, and a single field name will only trigger that field's validation.
 * @param options - should focus on the error field
 *
 * @returns validation result
 *
 * @example
 * ```tsx
 * useEffect(() => {
 *   trigger();
 * }, [trigger])
 *
 * <button onClick={async () => {
 *   const result = await trigger(); // result will be a boolean value
 * }}>
 *  trigger
 *  </button>
 * ```
 */
export type UseFormTrigger<TFieldValues extends FieldValues> = <
  TFieldName extends PathString,
>(
  name?:
    | Auto.FieldPath<TFieldValues, TFieldName>
    | Auto.FieldPath<TFieldValues, TFieldName>[]
    | readonly Auto.FieldPath<TFieldValues, TFieldName>[],
  options?: TriggerOptions,
) => Promise<boolean>;

/**
 * Clear the entire form errors.
 *
 * @remarks
 * [API](https://react-hook-form.com/api/useform/clearerrors) • [Demo](https://codesandbox.io/s/react-hook-form-v7-ts-clearerrors-w3ymx)
 *
 * @param name - the path name to the form field value.
 *
 * @example
 * Clear all errors
 * ```tsx
 * clearErrors(); // clear the entire form error
 * clearErrors(["name", "name1"]) // clear an array of fields' error
 * clearErrors("name2"); // clear a single field error
 * ```
 */
export type UseFormClearErrors<TFieldValues extends FieldValues> = <
  TFieldName extends PathString,
>(
  name?:
    | Auto.FieldPath<TFieldValues, TFieldName>
    | Auto.FieldPath<TFieldValues, TFieldName>[]
    | readonly Auto.FieldPath<TFieldValues, TFieldName>[],
) => void;

/**
 * Set a single field value, or a group of fields value.
 *
 * @remarks
 * [API](https://react-hook-form.com/api/useform/setvalue) • [Demo](https://codesandbox.io/s/react-hook-form-v7-ts-setvalue-8z9hx) • [Video](https://www.youtube.com/watch?v=qpv51sCH3fI)
 *
 * @param name - the path name to the form field value.
 * @param value - field value
 * @param options - should validate or update form state
 *
 * @example
 * ```tsx
 * // Update a single field
 * setValue('name', 'value', {
 *   shouldValidate: true, // trigger validation
 *   shouldTOuch: true, // update touched fields form state
 *   shouldDirty: true, // update dirty and dirty fields form state
 * });
 *
 * // Update a group fields
 * setValue('root', {
 *   a: 'test', // setValue('root.a', 'data')
 *   b: 'test1', // setValue('root.b', 'data')
 * });
 *
 * // Update a nested object field
 * setValue('select', { label: 'test', value: 'Test' });
 * ```
 */
export type UseFormSetValue<TFieldValues extends FieldValues> = <
  TFieldName extends PathString,
>(
  name: Auto.FieldPath<TFieldValues, TFieldName>,
  value: FieldPathSetValue<TFieldValues, TFieldName>,
  options?: SetValueOptions,
) => void;

/**
 * Set an error for the field. When set an error which is not associated to a field then manual `clearErrors` invoke is required.
 *
 * @remarks
 * [API](https://react-hook-form.com/api/useform/seterror) • [Demo](https://codesandbox.io/s/react-hook-form-v7-ts-seterror-nfxxu) • [Video](https://www.youtube.com/watch?v=raMqvE0YyIY)
 *
 * @param name - the path name to the form field value.
 * @param error - an error object which contains type and optional message
 * @param options - whether or not to focus on the field
 *
 * @example
 * ```tsx
 * // when the error is not associated with any fields, `clearError` will need to invoke to clear the error
 * const onSubmit = () => setError("serverError", { type: "server", message: "Error occurred"})
 *
 * <button onClick={() => setError("name", { type: "min" })} />
 *
 * // focus on the input after setting the error
 * <button onClick={() => setError("name", { type: "max" }, { shouldFocus: true })} />
 * ```
 */
export type UseFormSetError<TFieldValues extends FieldValues> = <
  TFieldName extends PathString,
>(
  name: Auto.FieldPath<TFieldValues, TFieldName>,
  error: ErrorOption,
  options?: {
    shouldFocus: boolean;
  },
) => void;

/**
 * Unregister a field reference and remove its value.
 *
 * @remarks
 * [API](https://react-hook-form.com/api/useform/unregister) • [Demo](https://codesandbox.io/s/react-hook-form-unregister-4k2ey) • [Video](https://www.youtube.com/watch?v=TM99g_NW5Gk&feature=emb_imp_woyt)
 *
 * @param name - the path name to the form field value.
 * @param options - keep form state options
 *
 * @example
 * ```tsx
 * register("name", { required: true })
 *
 * <button onClick={() => unregister("name")} />
 * // there are various keep options to retain formState
 * <button onClick={() => unregister("name", { keepErrors: true })} />
 * ```
 */
export type UseFormUnregister<TFieldValues extends FieldValues> = <
  TFieldName extends PathString,
>(
  name?:
    | Auto.FieldPath<TFieldValues, TFieldName>
    | Auto.FieldPath<TFieldValues, TFieldName>[]
    | readonly Auto.FieldPath<TFieldValues, TFieldName>[],
  options?: Omit<
    KeepStateOptions,
    | 'keepIsSubmitted'
    | 'keepSubmitCount'
    | 'keepValues'
    | 'keepDefaultValues'
    | 'keepErrors'
  > & { keepValue?: boolean; keepDefaultValue?: boolean; keepError?: boolean },
) => void;

/**
 * Validate the entire form. Handle submit and error callback.
 *
 * @remarks
 * [API](https://react-hook-form.com/api/useform/handlesubmit) • [Demo](https://codesandbox.io/s/react-hook-form-handlesubmit-ts-v7-lcrtu) • [Video](https://www.youtube.com/watch?v=KzcPKB9SOEk)
 *
 * @param onValid - callback function invoked after form pass validation
 * @param onInvalid - callback function invoked when form failed validation
 *
 * @returns callback - return callback function
 *
 * @example
 * ```tsx
 * const onSubmit = (data) => console.log(data);
 * const onError = (error) => console.log(error);
 *
 * <form onSubmit={handleSubmit(onSubmit, onError)} />
 * ```
 */
export type UseFormHandleSubmit<TFieldValues extends FieldValues> = (
  onValid: SubmitHandler<TFieldValues>,
  onInvalid?: SubmitErrorHandler<TFieldValues>,
) => (e?: React.BaseSyntheticEvent) => Promise<void>;

/**
 * Reset a field state and reference.
 *
 * @remarks
 * [API](https://react-hook-form.com/api/useform/resetfield) • [Demo](https://codesandbox.io/s/priceless-firefly-d0kuv) • [Video](https://www.youtube.com/watch?v=IdLFcNaEFEo)
 *
 * @param name - the path name to the form field value.
 * @param options - keep form state options
 *
 * @example
 * ```tsx
 * <input {...register("firstName", { required: true })} />
 * <button type="button" onClick={() => resetField("firstName"))}>Reset</button>
 * ```
 */
export type UseFormResetField<TFieldValues extends FieldValues> = <
  TFieldName extends PathString,
>(
  name: Auto.FieldPath<TFieldValues, TFieldName>,
  options?: Partial<{
    keepDirty: boolean;
    keepTouched: boolean;
    keepError: boolean;
    defaultValue: any;
  }>,
) => void;

/**
 * Reset at the entire form state.
 *
 * @remarks
 * [API](https://react-hook-form.com/api/useform/reset) • [Demo](https://codesandbox.io/s/react-hook-form-reset-v7-ts-pu901) • [Video](https://www.youtube.com/watch?v=qmCLBjyPwVk)
 *
 * @param values - the entire form values to be reset
 * @param keepStateOptions - keep form state options
 *
 * @example
 * ```tsx
 * useEffect(() => {
 *   // reset the entire form after component mount or form defaultValues is ready
 *   reset({
 *     fieldA: "test"
 *     fieldB: "test"
 *   });
 * }, [reset])
 *
 * // reset by combine with existing form values
 * reset({
 *   ...getValues(),
 *  fieldB: "test"
 *});
 *
 * // reset and keep form state
 * reset({
 *   ...getValues(),
 *}, {
 *   keepErrors: true,
 *   keepDirty: true
 *});
 * ```
 */
export type UseFormReset<TFieldValues extends FieldValues> = (
  values?: TFieldValues,
  keepStateOptions?: KeepStateOptions,
) => void;

export type WatchInternal<TFieldValues> = (
  fieldNames?: InternalFieldName | InternalFieldName[],
  defaultValue?: DeepPartial<TFieldValues>,
  isMounted?: boolean,
  isGlobal?: boolean,
) =>
  | FieldPathValue<FieldValues, InternalFieldName>
  | FieldPathValues<FieldValues, InternalFieldName[]>;

export type GetIsDirty = <TName extends InternalFieldName, TData>(
  name?: TName,
  data?: TData,
) => boolean;

export type FormStateSubjectRef<TFieldValues> = Subject<
  Partial<FormState<TFieldValues>> & { name?: InternalFieldName }
>;

export type Subjects<TFieldValues extends FieldValues = FieldValues> = {
  watch: Subject<{
    name?: InternalFieldName;
    type?: EventType;
    values?: FieldValues;
  }>;
  array: Subject<{
    name?: InternalFieldName;
    values?: FieldValues;
  }>;
  state: FormStateSubjectRef<TFieldValues>;
};

export type Names = {
  mount: InternalNameSet;
  unMount: InternalNameSet;
  array: InternalNameSet;
  watch: InternalNameSet;
  focus: InternalFieldName;
  watchAll: boolean;
};

export type BatchFieldArrayUpdate = <
  T extends Function,
  TFieldValues,
  TFieldArrayName extends PathString,
>(
  name: Auto.FieldArrayPath<TFieldValues, TFieldArrayName>,
  updatedFieldArrayValues?: Partial<
    FieldArray<TFieldValues, TFieldArrayName>
  >[],
  method?: T,
  args?: Partial<{
    argA: unknown;
    argB: unknown;
  }>,
  shouldSetValue?: boolean,
  shouldUpdateFieldsAndErrors?: boolean,
) => void;

export type Control<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
> = {
  _subjects: Subjects<TFieldValues>;
  _removeUnmounted: Noop;
  _names: Names;
  _stateFlags: {
    mount: boolean;
    action: boolean;
    watch: boolean;
  };
  _options: UseFormProps<TFieldValues, TContext>;
  _getDirty: GetIsDirty;
  _formState: FormState<TFieldValues>;
  _updateValid: Noop;
  _fields: FieldRefs;
  _formValues: FieldValues;
  _proxyFormState: ReadFormState;
  _defaultValues: Partial<TFieldValues>;
  _getWatch: WatchInternal<TFieldValues>;
  _updateFieldArray: BatchFieldArrayUpdate;
  _getFieldArray: <TFieldArrayValues>(
    name: InternalFieldName,
  ) => Partial<TFieldArrayValues>[];
  _executeSchema: (
    names: InternalFieldName[],
  ) => Promise<{ errors: FieldErrors }>;
  register: UseFormRegister<TFieldValues>;
  unregister: UseFormUnregister<TFieldValues>;
  getFieldState: UseFormGetFieldState<TFieldValues>;
};

export type WatchObserver<TFieldValues> = (
  value: DeepPartial<TFieldValues>,
  info: {
    name?: Branded.FieldPath<TFieldValues>;
    type?: EventType;
    value?: unknown;
  },
) => void;

export type UseFormReturn<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
> = {
  watch: UseFormWatch<TFieldValues>;
  getValues: UseFormGetValues<TFieldValues>;
  getFieldState: UseFormGetFieldState<TFieldValues>;
  setError: UseFormSetError<TFieldValues>;
  clearErrors: UseFormClearErrors<TFieldValues>;
  setValue: UseFormSetValue<TFieldValues>;
  trigger: UseFormTrigger<TFieldValues>;
  formState: FormState<TFieldValues>;
  resetField: UseFormResetField<TFieldValues>;
  reset: UseFormReset<TFieldValues>;
  handleSubmit: UseFormHandleSubmit<TFieldValues>;
  unregister: UseFormUnregister<TFieldValues>;
  control: Control<TFieldValues, TContext>;
  register: UseFormRegister<TFieldValues>;
  setFocus: UseFormSetFocus<TFieldValues>;
};

export type UseFormStateProps<TFieldValues, TFieldName extends PathString> = {
  control?: Control<TFieldValues>;
  disabled?: boolean;
  name?:
    | Auto.FieldPath<TFieldValues, TFieldName>
    | Auto.FieldPath<TFieldValues, TFieldName>[]
    | readonly Auto.FieldPath<TFieldValues, TFieldName>[];
  exact?: boolean;
};

export type UseFormStateReturn<TFieldValues> = FormState<TFieldValues>;

export type UseWatchProps<
  TFieldValues extends FieldValues,
  TFieldName extends PathString,
> = {
  defaultValue?: unknown;
  disabled?: boolean;
  name?:
    | Auto.FieldPath<TFieldValues, TFieldName>
    | Auto.FieldPath<TFieldValues, TFieldName>[]
    | readonly Auto.FieldPath<TFieldValues, TFieldName>[];
  control?: Control<TFieldValues>;
  exact?: boolean;
};

export type FormProviderProps<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
> = {
  children: React.ReactNode;
} & UseFormReturn<TFieldValues, TContext>;
