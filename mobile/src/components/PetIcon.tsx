import { Dog, Cat, Fish, Bird, Rabbit, Turtle, Rat, Origami } from 'lucide-react-native';
import { colors } from '../theme/colors';

export type PetType =
  | 'dog'
  | 'cat'
  | 'fish'
  | 'bird'
  | 'rabbit'
  | 'turtle'
  | 'hamster'
  | 'other'
  | null
  | undefined;

type Props = {
  type: PetType;
  size?: number;
  color?: string;
};

export function PetIcon({ type, size = 28, color = colors.primary }: Props) {
  const key = type ?? 'other';
  
  switch (key) {
    case 'dog':
      return <Dog size={size} color={color} />;
    case 'cat':
      return <Cat size={size} color={color} />;
    case 'fish':
      return <Fish size={size} color={color} />;
    case 'bird':
      return <Bird size={size} color={color} />;
    case 'rabbit':
      return <Rabbit size={size} color={color} />;
    case 'turtle':
      return <Turtle size={size} color={color} />;
    case 'hamster':
      return <Rat size={size} color={color} />;
    case 'other':
    default:
      return <Origami size={size} color={color} />;
  }
}

