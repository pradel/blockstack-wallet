import * as React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

interface Props {
  size?: number;
}

export function Moon({ size = 20, ...props }: SvgProps & Props) {
  return (
    <Svg
      viewBox="0 0 20 20"
      fill="currentColor"
      height={size}
      width={size}
      {...props}
    >
      <Path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
    </Svg>
  );
}
