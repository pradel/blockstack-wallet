import * as React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

interface Props {
  size?: number;
}

export function ChevronRight({ size = 20, ...props }: SvgProps & Props) {
  return (
    <Svg
      viewBox="0 0 20 20"
      fill="currentColor"
      height={size}
      width={size}
      {...props}
    >
      <Path
        fillRule="evenodd"
        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
        clipRule="evenodd"
      />
    </Svg>
  );
}
