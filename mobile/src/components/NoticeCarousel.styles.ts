import styled from 'styled-components/native';

export const NewsScroll = styled.ScrollView`
  margin-horizontal: -16px;
`;

export const NewsCard = styled.View`
  background-color: ${({ theme }) => theme.colors.secondary};
  border-color: ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.xl}px;
  border-width: 1px;
  gap: ${({ theme }) => theme.spacing.xs}px;
  margin-horizontal: ${({ theme }) => theme.spacing.md}px;
  min-height: 156px;
  padding: ${({ theme }) => theme.spacing.md}px;
`;

export const NewsBadge = styled.Text`
  align-self: flex-start;
  background-color: ${({ theme }) => theme.colors.primarySoft};
  border-radius: ${({ theme }) => theme.radius.pill}px;
  color: ${({ theme }) => theme.colors.primaryStrong};
  font-family: ${({ theme }) => theme.fonts.bodyBold};
  font-size: ${({ theme }) => theme.typography.caption}px;
  overflow: hidden;
  padding-horizontal: 10px;
  padding-vertical: 4px;
  letter-spacing: 0.8px;
  text-transform: uppercase;
`;

export const NewsTitle = styled.Text`
  color: ${({ theme }) => theme.colors.textOnPrimary};
  font-family: ${({ theme }) => theme.fonts.headingExtraBold};
  font-size: 18px;
  line-height: 24px;
`;

export const NewsDescription = styled.Text`
  color: rgba(255, 255, 255, 0.8);
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: ${({ theme }) => theme.typography.body}px;
  line-height: 20px;
`;

export const NewsDate = styled.Text`
  color: rgba(255, 255, 255, 0.66);
  font-family: ${({ theme }) => theme.fonts.bodySemiBold};
  font-size: ${({ theme }) => theme.typography.caption}px;
  text-transform: uppercase;
`;

export const NewsDots = styled.View`
  align-items: center;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing.xs}px;
  justify-content: center;
`;

export const NewsDot = styled.View<{ $active: boolean }>`
  background-color: ${({ theme, $active }) =>
    $active ? theme.colors.primary : theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.pill}px;
  height: 8px;
  width: ${({ $active }) => ($active ? 24 : 8)}px;
`;
