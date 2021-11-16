import * as React from 'react';
import {
  act as actComponent,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { act, renderHook } from '@testing-library/react-hooks';

import { VALIDATION_MODE } from '../../constants';
import * as generateId from '../../logic/generateId';
import { useFieldArray } from '../../useFieldArray';
import { useForm } from '../../useForm';

const mockGenerateId = () => {
  let id = 0;
  jest.spyOn(generateId, 'default').mockImplementation(() => (id++).toString());
};

describe('prepend', () => {
  beforeEach(() => {
    mockGenerateId();
  });

  it('should pre-append data into the fields', async () => {
    let currentFields: any = [];

    const Component = () => {
      const { control, register } = useForm<{
        test: {
          test: string;
        }[];
      }>();
      const { fields, prepend } = useFieldArray({
        control,
        name: 'test',
      });

      currentFields = fields;

      return (
        <form>
          {fields.map((field, index) => (
            <div key={field.id}>
              <input {...register(`test.${index}.test` as const)} />
            </div>
          ))}
          <button type={'button'} onClick={() => prepend({ test: 'test' })}>
            prepend
          </button>
          <button
            type={'button'}
            onClick={() =>
              prepend([{ test: 'test-batch' }, { test: 'test-batch1' }])
            }
          >
            prependBatch
          </button>
        </form>
      );
    };

    render(<Component />);

    await actComponent(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'prepend' }));
    });

    await actComponent(async () => {
      expect(currentFields).toEqual([{ id: '0', test: 'test' }]);
    });

    await actComponent(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'prepend' }));
    });

    act(() => {
      expect(currentFields).toEqual([
        { id: '2', test: 'test' },
        { id: '0', test: 'test' },
      ]);
    });

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'prependBatch' }));
    });

    act(() => {
      expect(currentFields).toEqual([
        { id: '5', test: 'test-batch' },
        { id: '6', test: 'test-batch1' },
        { id: '2', test: 'test' },
        { id: '0', test: 'test' },
      ]);
    });
  });

  it.each(['isDirty', 'dirtyFields'])(
    'should be dirtyFields when value is prepended with %s',
    () => {
      const { result } = renderHook(() => {
        const { register, formState, control } = useForm();
        const { fields, prepend } = useFieldArray({
          control,
          name: 'test',
        });

        return { register, formState, fields, prepend };
      });

      result.current.formState.isDirty;
      result.current.formState.dirtyFields;

      act(() => {
        result.current.prepend({ value: 'test' });
      });

      act(() => {
        result.current.prepend({ value: 'test1' });
      });

      act(() => {
        result.current.prepend({ value: 'test2' });
      });

      expect(result.current.formState.isDirty).toBeTruthy();
      expect(result.current.formState.dirtyFields).toEqual({
        test: [{ value: true }, { value: true }, { value: true }],
      });
    },
  );

  it('should set prepended values to formState.touchedFields', () => {
    let touched: any;

    const Component = () => {
      const { register, formState, control } = useForm();
      const { fields, prepend } = useFieldArray({
        control,
        name: 'test',
      });

      touched = formState.touchedFields;

      return (
        <form>
          {fields.map((field, i) => (
            <input key={field.id} {...register(`test.${i}.value`)} />
          ))}
          <button type="button" onClick={() => prepend({ value: `test${1}` })}>
            prepend
          </button>
        </form>
      );
    };

    render(<Component />);

    fireEvent.click(screen.getByRole('button', { name: /prepend/i }));

    fireEvent.blur(screen.getAllByRole('textbox')[0]);

    fireEvent.click(screen.getByRole('button', { name: /prepend/i }));
    fireEvent.click(screen.getByRole('button', { name: /prepend/i }));

    expect(touched).toEqual({
      test: [undefined, { value: true }, { value: true }],
    });
  });

  it('should prepend error', async () => {
    let errors: any;
    const Component = () => {
      const {
        register,
        formState: { errors: tempErrors },
        handleSubmit,
        control,
      } = useForm<{
        test: { value: string }[];
      }>();
      const { fields, prepend } = useFieldArray({
        control,
        name: 'test',
      });
      errors = tempErrors;

      return (
        <form onSubmit={handleSubmit(() => {})}>
          {fields.map((field, i) => (
            <input
              key={field.id}
              {...register(`test.${i}.value` as const, { required: true })}
            />
          ))}
          <button type="button" onClick={() => prepend({ value: '' })}>
            prepend
          </button>
          <button>submit</button>
        </form>
      );
    };

    render(<Component />);

    await actComponent(async () => {
      fireEvent.click(screen.getByRole('button', { name: /prepend/i }));
    });

    expect(errors.test).toBeUndefined();

    await actComponent(async () => {
      fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    });

    await actComponent(async () => {
      fireEvent.click(screen.getByRole('button', { name: /prepend/i }));
    });

    expect(errors.test).toHaveLength(2);
  });

  it('should trigger reRender when user is watching the all field array', () => {
    const watched: any[] = [];
    const Component = () => {
      const { register, watch, control } = useForm<{
        test: { value: string }[];
      }>();
      const { fields, prepend } = useFieldArray({
        control,
        name: 'test',
      });
      watched.push(watch());

      return (
        <form>
          {fields.map((field, i) => (
            <input key={field.id} {...register(`test.${i}.value` as const)} />
          ))}
          <button type="button" onClick={() => prepend({ value: '' })}>
            prepend
          </button>
        </form>
      );
    };

    render(<Component />);

    fireEvent.click(screen.getByRole('button', { name: 'prepend' }));

    expect(watched).toEqual([
      {}, // first render
      { test: [] }, // render inside useEffect in useFieldArray
      { test: [{ value: '' }] }, // render inside prepend method
      { test: [{ value: '' }] }, // render inside useEffect in useFieldArray
    ]);
  });

  it('should return watched value with watch API', async () => {
    const renderedItems: any = [];
    const Component = () => {
      const { watch, register, control } = useForm<{
        test: {
          value: string;
        }[];
      }>();
      const { fields, append, prepend } = useFieldArray({
        name: 'test',
        control,
      });
      const watched = watch('test');
      const isPrepended = React.useRef(false);
      if (isPrepended.current) {
        renderedItems.push(watched);
      }
      return (
        <div>
          {fields.map((field, i) => (
            <div key={`${field.id}`}>
              <input {...register(`test.${i}.value` as const)} />
            </div>
          ))}
          <button onClick={() => append({ value: '' })}>append</button>
          <button
            onClick={() => {
              prepend({ value: 'test' });
              isPrepended.current = true;
            }}
          >
            prepend
          </button>
        </div>
      );
    };

    render(<Component />);

    fireEvent.click(screen.getByRole('button', { name: /append/i }));
    fireEvent.click(screen.getByRole('button', { name: /append/i }));

    const inputs = screen.getAllByRole('textbox');

    fireEvent.input(inputs[0], {
      target: { name: 'test[0].value', value: '111' },
    });
    fireEvent.input(inputs[1], {
      target: { name: 'test[1].value', value: '222' },
    });

    fireEvent.click(screen.getByRole('button', { name: /prepend/i }));

    await waitFor(() =>
      expect(renderedItems).toEqual([
        [{ value: 'test' }, { value: '111' }, { value: '222' }],
        [{ value: 'test' }, { value: '111' }, { value: '222' }],
      ]),
    );
  });

  it('should focus if shouldFocus is true', () => {
    const Component = () => {
      const { register, control } = useForm<{
        test: { value: string }[];
      }>({
        defaultValues: {
          test: [{ value: '1' }, { value: '2' }],
        },
      });
      const { fields, prepend } = useFieldArray({ name: 'test', control });

      return (
        <form>
          {fields.map((field, i) => (
            <input key={field.id} {...register(`test.${i}.value` as const)} />
          ))}
          <button type="button" onClick={() => prepend({ value: '' })}>
            prepend
          </button>
        </form>
      );
    };

    render(<Component />);

    fireEvent.click(screen.getByRole('button', { name: /prepend/i }));

    const inputs = screen.getAllByRole('textbox');

    expect(inputs).toHaveLength(3);
    expect(document.activeElement).toEqual(inputs[0]);
  });

  it('should not focus if shouldFocus is false', () => {
    const Component = () => {
      const { register, control } = useForm({
        defaultValues: {
          test: [{ value: '1' }, { value: '2' }],
        },
      });
      const { fields, prepend } = useFieldArray({ name: 'test', control });

      return (
        <form>
          {fields.map((field, i) => (
            <input key={field.id} {...register(`test.${i}.value` as const)} />
          ))}
          <button
            type="button"
            onClick={() => prepend({ value: '' }, { shouldFocus: false })}
          >
            prepend
          </button>
        </form>
      );
    };

    render(<Component />);

    fireEvent.click(screen.getByRole('button', { name: /prepend/i }));
    const inputs = screen.getAllByRole('textbox');

    expect(inputs).toHaveLength(3);
    expect(document.activeElement).toEqual(document.body);
  });

  describe('with resolver', () => {
    it('should invoke resolver when formState.isValid true', async () => {
      const resolver = jest.fn().mockReturnValue({});

      const { result } = renderHook(() => {
        const { formState, control } = useForm({
          mode: VALIDATION_MODE.onChange,
          resolver,
        });
        const { prepend } = useFieldArray({ control, name: 'test' });
        return { formState, prepend };
      });

      result.current.formState.isValid;

      await act(async () => {
        result.current.prepend({ value: '1' });
      });

      expect(resolver).toBeCalledWith(
        {
          test: [{ value: '1' }],
        },
        undefined,
        {
          criteriaMode: undefined,
          fields: {},
          names: [],
        },
      );
    });

    it('should not invoke resolver when formState.isValid false', () => {
      const resolver = jest.fn().mockReturnValue({});

      const { result } = renderHook(() => {
        const { formState, control } = useForm({
          mode: VALIDATION_MODE.onChange,
          resolver,
        });
        const { prepend } = useFieldArray({ control, name: 'test' });
        return { formState, prepend };
      });

      act(() => {
        result.current.prepend({ value: '1' });
      });

      expect(resolver).toBeCalled();
    });
  });
});
