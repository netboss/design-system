import { useCallback, useEffect, useState } from 'react';
import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/react';
import WebComponentDocTemplate from '../../../../../../.storybook/docs/WebComponentDocTemplate.mdx';
import { webComponentDecorator } from '../storybook';
import './ds-autocomplete';
import { AutocompleteItem, AutocompleteItems } from '../../Autocomplete';
import uniqueId from 'lodash/uniqueId';
import '../ds-text-field';
import { MockedDataResponse, searchMock } from '../../Autocomplete/testMocks';
import debounce from '../../utilities/debounce';

const meta: Meta = {
  title: 'Web Components/ds-autocomplete',
  decorators: [webComponentDecorator],
  parameters: {
    docs: {
      page: WebComponentDocTemplate,
      componentEvents: {
        'ds-input-value-change': {
          description:
            'Called when the child `TextField` value changes. Is called with a string representing the input value.',
          eventObjectDescription: '`event.detail.value` - The `value` of the user input',
        },
        'ds-change': {
          description:
            'Called when the user selects an item and the selected item has changed. Called with the item that was selected.',
          eventObjectDescription: '`event.detail.selectedItem` - The user-selected item',
        },
      },
    },
  },
  args: {
    'clear-input-text': 'Clear search',
    'clear-search-button': true,
    'loading-message': 'Loading...',
    'no-results-message': 'No results',
    name: 'autocomplete',
  },
  argTypes: {
    'aria-clear-label': {
      description:
        "Screen reader-specific label for the Clear search `<button>`. Intended to provide a longer, more descriptive explanation of the button's behavior.",
      control: 'text',
    },
    'aria-complete-label': {
      description:
        'Control the `TextField` autocomplete attribute. Defaults to "off" to support accessibility. [Read more.](https://developer.mozilla.org/en-US/docs/Web/Security/Securing_your_site/Turning_off_form_autocompletion)',
      control: 'text',
    },
    autofocus: {
      description: 'Sets the focus on the select during the first mount',
      control: 'boolean',
    },
    children: { control: false, table: { disable: true } },
    'class-name': {
      description:
        'Additional classes to be added to the root element. Useful for adding utility classes.',
      control: 'text',
    },
    'clear-input-text': {
      description:
        'Text rendered on the page if `clearInput` prop is passed. Default is "Clear search".',
      control: 'text',
    },
    'clear-search-button': {
      description: 'Removes the Clear search button when set to `false`',
      control: 'boolean',
    },
    disabled: {
      description: 'Disables the input text field.',
      control: 'boolean',
    },
    'error-message': {
      description: 'Enable the error state by providing an error message',
      control: 'text',
    },
    'error-id': {
      description:
        'The ID of the error message applied to this field. If none is provided, the id will be derived from the `root-id` attribute.',
      control: 'text',
    },
    'error-placement': {
      description: 'Location of the error message relative to the field input',
      options: [undefined, 'top', 'bottom'],
      control: { type: 'radio' },
    },
    'error-message-class-name': {
      description:
        'Provides the option to add styling to error messages placed at the bottom of the autcomplete.',
      control: 'text',
    },
    hint: {
      description: 'An optional hint for the label',
      control: 'text',
    },
    'hint-id': {
      description: 'The ID of the hint element',
      control: 'text',
    },
    'hint-class-name': {
      control: 'text',
      description: 'Custom CSS class name(s) for the hint element',
    },
    items: {
      description: `An array of objects used to populate the suggestion list that appears below the input as users type. Passing an empty array will show a "No results" message. If you do not yet want to show results, this props should be undefined.
        
When using this in HTML, the \`items\` attribute must be a stringified JSON array wrapped in single quotes, with double quotes used for all object keys and string values.

**Example:**
\`<ds-autocomplete
  items='[
    {
      "id": "1",
      "name": "Advil"
    },
    {
      "id": "2",
      "name": "Benadryl"
    },
    {
      "id": "3",
      "name": "Claritin"
    }
  ]'
>
</ds-autocomplete>\`

If you're setting this attribute in JavaScript, use \`JSON.stringify()\` to convert the array into a valid string value.

For details on valid JSON formatting, see [JSON syntax restrictions on MDN](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/JSON#json_syntax_restrictions).
     
Please see examples for usage and [read the autocomplete docs](https://design.cms.gov/storybook/?path=/docs/components-autocomplete--docs).`,
      control: 'text',
    },
    label: {
      description: 'A label for the input',
      control: 'text',
    },
    'label-class-name': {
      description: 'Additional classes to be added to the field label',
      control: 'text',
    },
    'label-id': {
      description:
        "A unique `id` to be used on the field label. If one isn't provided, a unique ID will be generated.",
      control: 'text',
    },
    'requirement-label': {
      description:
        'Text showing the requirement (e.g., "Optional", or "Required"). In most cases, this should be used to indicate which fields are optional. See the [form guidelines](https://design.cms.gov/patterns/Forms/forms/) for more info.',
      control: 'text',
    },
    loading: {
      description:
        'Can be called when the `items` array is being fetched remotely, or will be delayed for more than 1-2 seconds.',
      control: 'boolean',
    },
    'loading-message': {
      description: 'Message users will see when the `loading` prop is passed to `Autocomplete`.',
      control: 'text',
    },
    'menu-heading': {
      description:
        "Adds a heading to the top of the autocomplete list. This can be used to convey to the user that they're required to select an option from the autocomplete list.",
      control: 'text',
    },
    'menu-heading-id': {
      description: 'A unique `id` to be used on the child `TextField` label tag',
      control: 'text',
    },
    name: {
      description: "The `input` field's `name` attribute.",
      control: 'text',
    },
    'no-results-message': {
      description:
        'Message users will see when the `items` array returns empty and the `loading` prop is passed to `<Autocomplete />`.',
      control: 'text',
    },
    'root-id': {
      description:
        "A unique ID for this element. A unique ID will be generated if one isn't provided.",
      control: 'text',
    },
    textFieldHint: {
      table: { disable: true },
    },
    textFieldLabel: {
      table: { disable: true },
    },
  },
};
export default meta;
type DSAutocompleteProps = Omit<React.JSX.IntrinsicElements['ds-autocomplete'], 'items'> & {
  items: AutocompleteItems;
};
type Story = StoryObj<DSAutocompleteProps>;

const Template = (args: DSAutocompleteProps) => {
  const { items, label, hint, ...autocompleteArgs } = args;
  const [input, setInput] = useState('');

  let filteredItems = null;
  if (input.length > 0 && items) {
    filteredItems = items
      .map((item) => {
        if ('label' in item) {
          // Handle grouped items
          const filteredGroupItems = item.items.filter(
            (groupItem) =>
              !groupItem.name || groupItem.name.toLowerCase().includes(input.toLowerCase())
          );

          if (filteredGroupItems.length === 0) {
            return null;
          }

          return {
            ...item,
            items: filteredGroupItems,
          };
        } else {
          // Handle standalone items
          return !item.name || item.name.toLowerCase().includes(input.toLowerCase()) ? item : null;
        }
      })
      .filter(Boolean);
  }

  useEffect(() => {
    const element = document.querySelector('ds-autocomplete');
    if (element) {
      const handleOnChange = (event: CustomEvent<{ selectedItem: AutocompleteItem }>) => {
        setInput(event.detail.selectedItem.name);
        return action('ds-change')(event);
      };
      const handleOnInputValueChange = (event: CustomEvent<{ value: string }>) => {
        action('ds-input-value-change')(event);
        setInput(event.detail.value);
      };
      element.addEventListener('ds-change', handleOnChange);
      element.addEventListener('ds-input-value-change', handleOnInputValueChange);
      return () => {
        element.removeEventListener('ds-change', handleOnChange);
        element.removeEventListener('ds-input-value-change', handleOnInputValueChange);
      };
    }
  }, []);
  return (
    <ds-autocomplete
      {...autocompleteArgs}
      items={JSON.stringify(filteredItems)}
      label={label}
      hint={hint}
    />
  );
};

function makeGroup(label: string, items: ReturnType<typeof makeItem>[]) {
  return {
    id: uniqueId(),
    label,
    items,
  };
}

function makeItem(name: string, children?: React.ReactNode) {
  return {
    id: uniqueId(),
    name,
    children,
  };
}

export const Default: Story = {
  render: Template,
  args: {
    label: 'Enter and select a drug to see its cost under each plan.',
    hint: 'Type a letter to see results, then use ARROW keys to change options, ENTER key to make a selection, ESC to dismiss.',
    items: [
      makeItem('Acetaminophen'),
      makeItem('Advil'),
      makeItem('Benadryl'),
      makeItem('Claritin'),
      makeItem('Detrol'),
      makeItem('Excedrin'),
      makeItem('Flonase'),
      makeItem('Gas-X'),
      makeItem('Hydrocortisone'),
      makeItem('Ibuprofen'),
      makeItem('Insulin glargine'),
      makeItem('Jublia'),
      makeItem('Ketoprofen'),
      makeItem('Lidocaine'),
      makeItem('Lunestra'),
      makeItem('Melatonin'),
      makeItem('Meloxicam'),
      makeItem('Neosporin'),
      makeItem('Oxycodone'),
      makeItem('Prednisone'),
      makeItem('Prilosec'),
      makeItem('Quinine'),
      makeItem('Robitussin'),
      makeItem('Sudafed'),
      makeItem('Tamiflu'),
      makeItem('Unisom'),
      makeItem('Vicodin'),
      makeItem('Warfarin'),
      makeItem('Xanax'),
      makeItem('Yonsa'),
      makeItem('Zyrtec'),
    ],
  },
};

export const LabeledList: Story = {
  render: Template,
  args: {
    label: 'Search for and select your county.',
    hint: 'Type "C" then use ARROW keys to change options, ENTER key to make a selection, ESC to dismiss.',
    'menu-heading': 'Select from the options below:',
    items: [
      makeItem('Cook County, IL'),
      makeItem('Cook County, MD'),
      makeItem('Cook County, TN'),
      makeItem('Cook County, AK'),
      makeItem('Cook County, FL'),
      makeItem('Cook County, AL'),
      makeItem('Cook County, WA'),
      makeItem('Cook County, OR'),
    ],
  },
};

export const ItemGroups = {
  render: Template,
  args: {
    label: 'Select a state.',
    hint: 'Type "A" then use ARROW keys to change options, ENTER key to make a selection, ESC to dismiss.',
    items: [
      makeGroup('Group A', [
        makeItem('Alabama'),
        makeItem('Alaska'),
        makeItem('Arizona'),
        makeItem('Arkansas'),
      ]),
      makeGroup('Group C', [makeItem('California'), makeItem('Colorado'), makeItem('Connecticut')]),
      makeGroup('Group D', [makeItem('Delaware'), makeItem('District of Columbia')]),
    ],
  },
};

export const GroupsAndStandaloneItems = {
  render: Template,
  args: {
    label: 'Search for a healthcare specialty or doctor’s office.',
    hint: 'Type to filter options. Use ARROW keys to navigate, ENTER to select, ESC to dismiss.',
    items: [
      makeItem('Care Clinic - Specialty Center'),
      makeItem('Healthy Life Gastroenterology - Main Campus'),
      makeItem('Dermatology Associates - East Wing'),
      makeGroup('Healthcare Specialties', [
        makeItem('Pediatrics'),
        makeItem('Gastroenterology'),
        makeItem('Dermatology'),
        makeItem('Cardiology'),
        makeItem('Neurology'),
        makeItem('Orthopedics'),
      ]),
    ],
  },
};

// export const CustomMarkup = {
//   render: Template,
//   args: {
//     textFieldLabel: 'Select a snack that starts with "C".',
//     textFieldHint:
//       'Type "C" to start seeing a list of snacks. Clicking the last item should not change the input value to "Search all snacks"',
//     label: 'Select from the options below:',
//     items: [
//       makeItem(
//         'Carrots (1)',
//         <>
//           Carrots <strong>(1)</strong>
//         </>
//       ),
//       makeItem(
//         'Cookies (3)',
//         <>
//           Cookies <strong>(3)</strong>
//         </>
//       ),
//       makeItem(
//         'Crackers (2)',
//         <>
//           Crackers <strong>(2)</strong>
//         </>
//       ),
//       {
//         children: (
//           <a href="#snacks" onClick={() => console.log('Searching for all the snacks!')}>
//             Search all snacks
//           </a>
//         ),
//         className: 'ds-c-autocomplete__search-all',
//         isResult: false,
//       },
//     ],
//   } as any,

//   parameters: {
//     docs: {
//       source: {
//         code: 'Disabled for this story. See https://github.com/storybookjs/storybook/issues/11554',
//       },
//     },
//   },
// };

export const LoadingMessage: Story = {
  render: Template,
  args: {
    'clear-search-button': 'false',
    loading: 'true',
    items: [],
    label: 'This will only show a loading message.',
    hint: 'List should return string Loading to simulate async data call.',
  },
};

export const NoResults: Story = {
  render: Template,
  args: {
    items: [],
    'clear-search-button': 'false',
    label: 'This will show a "no results" message.',
    hint: 'Start typing, but you’ll only get a "no results" message.',
  },
};

export const AsyncItems: Story = {
  render: function Component(args: DSAutocompleteProps) {
    const { items, ...autocompleteArgs } = args;
    const [input, setInput] = useState('');
    const [additionalItems, setAdditionalItems] = useState<AutocompleteItem[]>([]);
    const hasResults = input.length > 2 && additionalItems.length;

    const searchArtwork = () => {
      // Note: the response is mocked
      const searchURL = `https://api.artic.edu/api/v1/artworks/search?q=${input}&fields=id,title,artist_title&limit=10`;
      fetch(searchURL)
        .then((response) => {
          if (response.status === 200) {
            return response.json();
          }
        })
        .then(({ data }: { data: MockedDataResponse[] }) => {
          const additionalItems = data.map(({ id, title, artist_title }) => ({
            id: id.toString(),
            name: `${title} by ${artist_title}`,
          }));
          setAdditionalItems(additionalItems);
        });
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedSearch = useCallback(
      debounce(() => {
        searchArtwork();
      }, 500),
      []
    );

    useEffect(() => {
      const element = document.querySelector('ds-autocomplete');
      if (element) {
        const handleOnChange = (event: CustomEvent<{ selectedItem: AutocompleteItem }>) => {
          setInput(event.detail.selectedItem.name);
          return action('ds-change')(event);
        };
        const handleOnInputValueChange = (event: CustomEvent<{ value: string }>) => {
          action('ds-input-value-change')(event);
          setInput(event.detail.value);
          if (input.length > 2 && input !== event.detail.value) {
            debouncedSearch();
          }
        };
        element.addEventListener('ds-change', handleOnChange);
        element.addEventListener('ds-input-value-change', handleOnInputValueChange);
        return () => {
          element.removeEventListener('ds-change', handleOnChange);
          element.removeEventListener('ds-input-value-change', handleOnInputValueChange);
        };
      }
    }, [debouncedSearch, input]);

    return (
      <ds-autocomplete
        {...autocompleteArgs}
        menu-heading={hasResults ? undefined : autocompleteArgs['menu-heading']}
        onChange={action('onChange')}
        items={hasResults ? JSON.stringify(additionalItems) : JSON.stringify(items)}
      />
    );
  },
  args: {
    label: 'Search for artwork',
    hint: 'Enter the name of an artist, title, or genre',
    'menu-heading': 'Popular searches includes:',
    items: [
      makeItem('Mountains'),
      makeItem('Watercolor'),
      makeItem("Georgia O'Keeffe"),
      makeItem('City Landscape'),
      makeItem('Self-Portrait'),
    ],
  },
  parameters: {
    fetchMock: {
      mocks: [searchMock],
    },
  },
};
