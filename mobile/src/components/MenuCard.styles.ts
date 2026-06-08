import styled from 'styled-components/native';

export const CardRoot = styled.Pressable`
  background-color: ${({ theme }) => theme.colors.surface};
  border-color: ${({ theme }) => theme.colors.border};
  border-left-color: ${({ theme }) => theme.colors.primary};
  border-left-width: 4px;
  border-radius: ${({ theme }) => theme.radius.lg}px;
  border-width: 1px;
  gap: ${({ theme }) => theme.spacing.sm}px;
  padding: ${({ theme }) => theme.spacing.lg}px;
  shadow-color: #0f172a;
  shadow-offset: 0px 12px;
  shadow-opacity: 0.06;
  shadow-radius: 24px;
  elevation: 3;
`;

export const CardBadge = styled.Text`
  align-self: flex-start;
  background-color: ${({ theme }) => theme.colors.primarySoft};
  border-radius: ${({ theme }) => theme.radius.pill}px;
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.fonts.bodyBold};
  font-size: ${({ theme }) => theme.typography.caption}px;
  overflow: hidden;
  padding-horizontal: 12px;
  padding-vertical: 6px;
  text-transform: uppercase;
`;

export const CardTitle = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.fonts.headingBold};
  font-size: 18px;
`;

export const CardDescription = styled.Text`
  color: ${({ theme }) => theme.colors.textMuted};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.typography.body}px;
  line-height: 22px;
`;

export const CardFooter = styled.View`
  margin-top: ${({ theme }) => theme.spacing.sm}px;
`;

export const CardLink = styled.Text`
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.fonts.bodySemiBold};
  font-size: ${({ theme }) => theme.typography.body}px;
`;
