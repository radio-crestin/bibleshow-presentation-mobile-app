import { View } from 'react-native';
import { styles } from './styles';

type SkeletonLoaderProps = {
  numberOfLines: number;
  fontSize: number;
};

export function SkeletonLoader({ numberOfLines, fontSize }: SkeletonLoaderProps) {
  return (
    <View style={[styles.verseContent, styles.skeletonContainer]}>
      <View style={[styles.skeletonLine, styles.skeletonTitle, { height: fontSize }]} />
      {[...Array(numberOfLines)].map((_, index) => (
        <View 
          key={index}
          style={[
            styles.skeletonLine,
            { 
              height: fontSize,
              width: `${Math.random() * 40 + 60}%`
            }
          ]} 
        />
      ))}
    </View>
  );
}
