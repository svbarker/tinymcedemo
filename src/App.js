import React, {useRef} from 'react';
import {renderToString} from 'react-dom/server';
import {Editor} from '@tinymce/tinymce-react';

export default function App() {
  const editorRef = useRef(null);
  const log = () => {
    if (editorRef.current) {
      console.log(editorRef.current.getContent());
    }
  };

  const Mention = ({children}) => {
    return (
      <span style={{color: '#2277cc', fontWeight: 'bold'}}>
        {children}
      </span>
    )
  }
  
  const getMentionOptions = async pattern => {
    const response = await fetch(`http://swapi.dev/api/people/?search=${pattern}`);
    const data = await response.json();
    return data.results.map(person => ({title: person.name, subTitle: person.birth_year, value: person.name}));
  }

  return (
    <>
      <Editor
        tinymceScriptSrc={process.env.PUBLIC_URL + '/tinymce/tinymce.min.js'}
        onInit={(evt, editor) => {
          editorRef.current = editor

          const onAction = (autocompleteApi, rng, value) => {
            editor.selection.setRng(rng);
            editor.insertContent(renderToString(<Mention>@{value}</Mention>));
            autocompleteApi.hide();
          };

          editor.ui.registry.addAutocompleter('at-mentions', {
            trigger: '@',
            minChars: 2,
            columns: 1,
            onAction: onAction,
            fetch: async (pattern) => {
              const data = await getMentionOptions(pattern)
              return data.map(person => ({
                type: 'cardmenuitem',
                value: person.value,
                label: person.title,
                items: [{
                  type: 'cardcontainer',
                  direction: 'horizontal',
                  items: [
                    {
                      type: 'cardimage',
                      src: 'https://upload.wikimedia.org/wikipedia/commons/4/4f/Twitter-logo.svg',
                      alt: 'Test Image',
                      classes: ['cardmenuitem-image']
                    },
                    {
                      type: 'cardtext',
                      text: person.title,
                      name: 'char_name',
                      classes: ['cardmenuitem-title']
                    },
                    {
                      type: 'cardtext',
                      text: person.subTitle,
                      classes: ['cardmenuitem-subtitle']
                    }
                  ]
                }],
            }))},
          });
        }}
        initialValue='<p>This is the initial content of the editor.</p>'
        init={{
          height: 500,
          menubar: false,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'preview', 'help', 'wordcount'
          ],
          toolbar: 'undo redo | blocks | ' +
            'bold italic forecolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | link | ' +
            'removeformat | help',
          content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
          getMentionOptions: getMentionOptions,
        }}
      />
      <button onClick={log}>Log editor content</button>
    </>
  );
}