import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { RadioGroup } from '@/components/ui/RadioGroup';
import { Toggle } from '@/components/ui/Toggle';
import { FormRow } from '@/components/ui/FormRow';

export const FormInputsDemo = () => {
  const [inputValue, setInputValue] = useState('');
  const [textareaValue, setTextareaValue] = useState('');
  const [selectValue, setSelectValue] = useState('');
  const [checkboxValue, setCheckboxValue] = useState(false);
  const [radioValue, setRadioValue] = useState('');
  const [toggleValue, setToggleValue] = useState(false);

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Form Components</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <FormRow label="Text Input" htmlFor="text-input" help="Enter some text" required>
              <Input
                id="text-input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type something..."
              />
            </FormRow>

            <FormRow label="Email Input" htmlFor="email-input">
              <Input
                id="email-input"
                type="email"
                placeholder="you@example.com"
              />
            </FormRow>

            <FormRow label="Password Input" htmlFor="password-input">
              <Input
                id="password-input"
                type="password"
                placeholder="Enter password"
              />
            </FormRow>

            <FormRow label="Disabled Input" htmlFor="disabled-input">
              <Input
                id="disabled-input"
                disabled
                value="This is disabled"
              />
            </FormRow>

            <FormRow label="Input with Error" htmlFor="error-input" error="This field is required">
              <Input
                id="error-input"
                placeholder="Required field"
              />
            </FormRow>
          </div>

          <div className="space-y-4">
            <FormRow label="Textarea" htmlFor="textarea" help="Enter a longer message">
              <Textarea
                id="textarea"
                value={textareaValue}
                onChange={(e) => setTextareaValue(e.target.value)}
                placeholder="Type a message..."
                rows={4}
              />
            </FormRow>

            <FormRow label="Select Dropdown" htmlFor="select">
              <Select
                id="select"
                value={selectValue}
                onChange={(e) => setSelectValue(e.target.value)}
              >
                <option value="">Choose an option</option>
                <option value="option1">Option 1</option>
                <option value="option2">Option 2</option>
                <option value="option3">Option 3</option>
              </Select>
            </FormRow>

            <FormRow label="Checkbox">
              <Checkbox
                label="I agree to the terms and conditions"
                checked={checkboxValue}
                onChange={(e) => setCheckboxValue(e.target.checked)}
              />
            </FormRow>

            <FormRow label="Radio Group">
              <RadioGroup
                name="radio-demo"
                options={[
                  { value: 'option1', label: 'Option 1' },
                  { value: 'option2', label: 'Option 2' },
                  { value: 'option3', label: 'Option 3' },
                ]}
                value={radioValue}
                onChange={setRadioValue}
              />
            </FormRow>

            <FormRow label="Toggle Switch">
              <Toggle
                label="Enable notifications"
                checked={toggleValue}
                onChange={(e) => setToggleValue(e.target.checked)}
              />
            </FormRow>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">States</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Default</h4>
            <Input placeholder="Default state" />
            <Textarea placeholder="Default textarea" rows={3} />
            <Checkbox label="Default checkbox" />
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Disabled</h4>
            <Input placeholder="Disabled" disabled />
            <Textarea placeholder="Disabled textarea" disabled rows={3} />
            <Checkbox label="Disabled checkbox" disabled />
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">With Values</h4>
            <Input value="Filled input" readOnly />
            <Textarea value="Filled textarea" readOnly rows={3} />
            <Checkbox label="Checked checkbox" checked readOnly />
          </div>
        </div>
      </div>
    </div>
  );
};
