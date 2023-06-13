import tinymce from 'tinymce';

tinymce.PluginManager.add('at-mentions', (editor, url) => {
    const getMentionOptions = editor.options.get('getMentionOptions');

    const mentionPattern = () => /@\w\w+/g;

    editor.options.register('mention_pattern', {
      processor: 'regexp',
      default: new RegExp('^' + mentionPattern().source + '$', 'i')
    });

    editor.on('keydown', e => {
      const mention = editor.options.get('mention_pattern');
      console.log(mention);
    })

    return {
        getMetadata: () => ({
          name: '@ Mentions'
        })
      };
});