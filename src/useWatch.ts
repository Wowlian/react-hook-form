import * as React from 'react';
import { useFormContext } from './useFormContext';
import isUndefined from './utils/isUndefined';
import isString from './utils/isString';
import {
  DeepPartial,
  UseWatchProps,
  FieldValues,
  UnpackNestedValue,
  Control,
  FieldPath,
  InternalFieldName,
  FieldPathValue,
  FieldPathValues,
} from './types';

export function useWatch<
  TFieldValues extends FieldValues = FieldValues
>(props: {
  defaultValue?: UnpackNestedValue<DeepPartial<TFieldValues>>;
  control?: Control<TFieldValues>;
}): UnpackNestedValue<DeepPartial<TFieldValues>>;
export function useWatch<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(props: {
  name: TName;
  defaultValue?: FieldPathValue<TFieldValues, TName>;
  control?: Control<TFieldValues>;
}): FieldPathValue<TFieldValues, TName>;
export function useWatch<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues>[] = FieldPath<TFieldValues>[]
>(props: {
  name: TName;
  defaultValue?: UnpackNestedValue<DeepPartial<TFieldValues>>;
  control?: Control<TFieldValues>;
}): FieldPathValues<TFieldValues, TName>;
export function useWatch<TFieldValues>({
  control,
  name,
  defaultValue,
}: UseWatchProps<TFieldValues>) {
  const methods = useFormContext();

  const { watchInternal, watchSubjectRef } = control || methods.control;
  const [value, updateValue] = React.useState<unknown>(
    isUndefined(defaultValue)
      ? watchInternal(name as InternalFieldName)
      : defaultValue,
  );

  React.useEffect(() => {
    watchInternal(name as InternalFieldName);

    const watchSubscription = watchSubjectRef.current.subscribe({
      next: ({ name: inputName, value }) => {
        (!name ||
          !inputName ||
          (Array.isArray(name) ? name : [name]).some(
            (fieldName) =>
              inputName &&
              fieldName &&
              inputName.startsWith(fieldName as InternalFieldName),
          )) &&
          updateValue(
            isString(inputName) && name === inputName && !isUndefined(value)
              ? value
              : watchInternal(name as string, defaultValue),
          );
      },
    });

    return () => watchSubscription.unsubscribe();
  }, [name]);

  return value;
}
