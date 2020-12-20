import React from 'react';
import { useForm } from 'react-hook-form';

let renderCounter = 0;

function TriggerValidation() {
  const {
    register,
    trigger,
    formState: { errors },
  } = useForm<{
    test: string;
    test1: string;
    test2: string;
  }>();

  renderCounter++;

  return (
    <>
      <input name="test" ref={register({ required: true })} />
      <div id="testError">{errors.test && 'required'}</div>

      <input name="test1" ref={register({ required: true })} />
      <div id="test1Error">{errors.test1 && 'required'}</div>

      <input name="test2" ref={register({ required: true })} />
      <div id="test2Error">{errors.test2 && 'required'}</div>

      <button id="single" type="button" onClick={() => trigger('test')}>
        trigger single
      </button>

      <button
        id="multiple"
        type="button"
        onClick={() => trigger(['test1', 'test2'])}
      >
        trigger multiple
      </button>

      <div id="renderCount">{renderCounter}</div>
    </>
  );
}

export default TriggerValidation;
