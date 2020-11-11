import * as React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

interface Props {
  size?: number;
}

export function Clipboard({ size = 20, ...props }: SvgProps & Props) {
  return (
    <Svg
      viewBox="0 0 20 20"
      fill="currentColor"
      height={size}
      width={size}
      {...props}
    >
      <Path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
      <Path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
    </Svg>
  );
}
