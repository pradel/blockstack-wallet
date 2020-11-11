import * as React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

interface Props {
  size?: number;
}

export function QuestionMarkCircle({ size = 20, ...props }: SvgProps & Props) {
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
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
        clipRule="evenodd"
      />
    </Svg>
  );
}
