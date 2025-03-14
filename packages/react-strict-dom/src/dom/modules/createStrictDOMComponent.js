/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

import type { CompiledStyles } from '@stylexjs/stylex/lib/StyleXTypes';
import type { StrictProps, ReactDOMStyleProps } from '../../types/StrictProps';
import type { StrictHTMLElement } from '../../types/StrictHTMLElement';

import * as React from 'react';
import * as stylex from '@stylexjs/stylex';
import { strictAttributeSet } from '../../shared/strictAttributes';

// $FlowFixMe[unclear-type]
function validateStrictProps(props: any) {
  Object.keys(props).forEach((key) => {
    const isValid = strictAttributeSet.has(key);
    if (!isValid) {
      console.error(`React Strict DOM: "${key}" is not a valid prop`);
      delete props[key];
    }
  });
}

export function createStrictDOMComponent<T: StrictHTMLElement, P: StrictProps>(
  TagName: string,
  defaultStyle: StrictProps['style']
): React.AbstractComponent<P, T> {
  // NOTE: `debug-style` is not generated by `stylex.create`
  // so it needs a type-cast
  const debugStyle: CompiledStyles = {
    $$css: true,
    'debug::name': (`html-${TagName}`: $FlowFixMe)
  };

  const component: React.AbstractComponent<P, T> = React.forwardRef(
    function (props, forwardedRef) {
      /**
       * get host props
       */
      const { for: htmlFor, style, ...restProps } = props;
      const hostProps: { ...P, htmlFor?: string } = restProps;
      validateStrictProps(hostProps);

      if (htmlFor != null) {
        hostProps.htmlFor = htmlFor;
      }
      if (props.role != null) {
        // "presentation" synonym has wider browser support
        // $FlowFixMe
        hostProps.role = props.role === 'none' ? 'presentation' : props.role;
      }
      if (TagName === 'button') {
        hostProps.type = hostProps.type ? hostProps.type : 'button';
      } else if (TagName === 'input' || TagName === 'textarea') {
        hostProps.dir = hostProps.dir ? hostProps.dir : 'auto';
      }

      /**
       * get host style props
       */
      // Waiting on a diff so we can remove this indirection.
      const hostStyleProps: ReactDOMStyleProps = stylex.props([
        debugStyle,
        defaultStyle,
        style
      ]);

      /**
       * Construct tree
       *
       * Intentional flow error as we are asking for a more specific type
       * than React itself.
       */
      const element = (
        <TagName
          {...hostProps}
          {...hostStyleProps}
          ref={(forwardedRef: $FlowFixMe)}
        />
      );
      return element;
    }
  );

  component.displayName = `html.${TagName}`;
  return component;
}
