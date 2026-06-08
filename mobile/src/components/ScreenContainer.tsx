import { PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { Edge, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Content,
  HeaderCard,
  HeaderSubtitle,
  HeaderTitle,
  ScrollBody,
  ScreenBody,
  ScreenSurface,
} from './ScreenContainer.styles';

type ScreenContainerProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
  scrollable?: boolean;
  includeTopInset?: boolean;
}>;

export function ScreenContainer({
  children,
  title,
  subtitle,
  scrollable = true,
  includeTopInset = false,
}: ScreenContainerProps) {
  const insets = useSafeAreaInsets();
  const safeAreaEdges: Edge[] = includeTopInset
    ? ['top', 'left', 'right', 'bottom']
    : ['left', 'right', 'bottom'];

  const content = (
    <Content style={{ paddingBottom: 16 + insets.bottom }}>
      <HeaderCard>
        <HeaderTitle>{title}</HeaderTitle>
        {subtitle ? <HeaderSubtitle>{subtitle}</HeaderSubtitle> : null}
      </HeaderCard>
      {children}
    </Content>
  );

  return (
    <SafeAreaView edges={safeAreaEdges} style={{ flex: 1 }}>
      <ScreenSurface>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {scrollable ? <ScrollBody>{content}</ScrollBody> : <ScreenBody>{content}</ScreenBody>}
      </KeyboardAvoidingView>
      </ScreenSurface>
    </SafeAreaView>
  );
}
