import t from 'tcomb-validation';
import bootstrap from 'uvdom-bootstrap';
import Breakpoints from './Breakpoints';
import Size from './Size';
import getLabel from './getLabel';
import getError from './getError';
import getHelp from './getHelp';

const TextboxConfig = t.struct({
  addonBefore: t.Any,
  addonAfter: t.Any,
  horizontal: t.maybe(Breakpoints),
  size: t.maybe(Size),
  buttonBefore: t.Any,
  buttonAfter: t.Any
}, 'TextboxConfig');

function getInputGroupButton(button) {
  return {
    tag: 'div',
    attrs: {
      className: {
        'input-group-btn': true
      }
    },
    children: button
  };
}

export default function textbox(locals) {

  locals.config = textbox.getConfig(locals);
  locals.attrs = textbox.getAttrs(locals);

  if (locals.type === 'hidden') {
    return textbox.renderHiddenTextbox(locals);
  }

  const children = locals.config.horizontal ?
    textbox.renderHorizontal(locals) :
    textbox.renderVertical(locals);

  return textbox.renderFormGroup(children, locals);
}

textbox.getConfig = function (locals) {
  return new TextboxConfig(locals.config || {});
};

textbox.getAttrs = function (locals) {
  const attrs = t.mixin({}, locals.attrs);
  attrs.type = locals.type;
  attrs.className = t.mixin({}, attrs.className);
  attrs.className['form-control'] = true;

  attrs.disabled = locals.disabled;
  if (locals.type !== 'file') {
    attrs.value = locals.value;
  }
  attrs.onChange = locals.type === 'file' ?
    evt => locals.onChange(evt.target.files[0]) :
    evt => locals.onChange(evt.target.value);

  if (locals.help) {
    attrs['aria-describedby'] = attrs['aria-describedby'] || attrs.id + '-tip';
  }
  return attrs;
};

textbox.renderHiddenTextbox = function (locals) {
  return {
    tag: 'input',
    attrs: {
      type: 'hidden',
      value: locals.value,
      name: locals.name
    }
  };
};

textbox.renderStatic = function (locals) {
  return bootstrap.getStatic(locals.value);
};

textbox.renderTextbox = function (locals) {
  if (locals.type === 'static') {
    return textbox.renderStatic(locals);
  }
  let ret = locals.type !== 'textarea' ?
    textbox.renderInput(locals) :
    textbox.renderTextarea(locals);
  if (locals.config.addonBefore || locals.config.addonAfter || locals.config.buttonBefore || locals.config.buttonAfter) {
    ret = textbox.renderInputGroup(ret, locals);
  }
  return ret;
};

textbox.renderInputGroup = function (input, locals) {
  return bootstrap.getInputGroup([
    locals.config.buttonBefore ? getInputGroupButton(locals.config.buttonBefore) : null,
    locals.config.addonBefore ? bootstrap.getAddon(locals.config.addonBefore) : null,
    input,
    locals.config.addonAfter ? bootstrap.getAddon(locals.config.addonAfter) : null,
    locals.config.buttonAfter ? getInputGroupButton(locals.config.buttonAfter) : null
  ]);
};

textbox.renderInput = function (locals) {
  return {
    tag: 'input',
    attrs: locals.attrs
  };
};

textbox.renderTextarea = function (locals) {
  return {
    tag: 'textarea',
    attrs: locals.attrs
  };
};

textbox.renderLabel = function (locals) {
  return getLabel({
    label: locals.label,
    htmlFor: locals.attrs.id,
    breakpoints: locals.config.horizontal
  });
};

textbox.renderError = function (locals) {
  return getError(locals);
};

textbox.renderHelp = function (locals) {
  return getHelp(locals);
};

textbox.renderVertical = function (locals) {
  return [
    textbox.renderLabel(locals),
    textbox.renderTextbox(locals),
    textbox.renderError(locals),
    textbox.renderHelp(locals)
  ];
};

textbox.renderHorizontal = function (locals) {
  const label = textbox.renderLabel(locals);
  return [
    label,
    {
      tag: 'div',
      attrs: {
        className: label ? locals.config.horizontal.getInputClassName() : locals.config.horizontal.getOffsetClassName()
      },
      children: [
        textbox.renderTextbox(locals),
        textbox.renderError(locals),
        textbox.renderHelp(locals)
      ]
    }
  ];
};

textbox.renderFormGroup = function (children, locals) {
  return bootstrap.getFormGroup({
    className: 'form-group-depth-' + locals.path.length,
    hasError: locals.hasError,
    children
  });
};
