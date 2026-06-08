import {
  CardBadge,
  CardDescription,
  CardFooter,
  CardLink,
  CardRoot,
  CardTitle,
} from './MenuCard.styles';

type MenuCardProps = {
  title: string;
  description: string;
  badge: string;
  onPress: () => void;
};

export function MenuCard({
  title,
  description,
  badge,
  onPress,
}: MenuCardProps) {
  return (
    <CardRoot onPress={onPress}>
      <CardBadge>{badge}</CardBadge>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
      <CardFooter>
        <CardLink>Acessar modulo</CardLink>
      </CardFooter>
    </CardRoot>
  );
}
