import { useEffect } from "react";
import { Canvas, useImage, Image, Group } from "@shopify/react-native-skia";
import { useWindowDimensions } from "react-native";
import {
  useSharedValue,
  useDerivedValue,
  withTiming,
  Easing,
  withSequence,
  withRepeat,
  useFrameCallback,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import {
  GestureHandlerRootView,
  GestureDetector,
  Gesture,
} from "react-native-gesture-handler";

const GRAVITY = 1000;
const JUMP_FORCE = -500;

const App = () => {
  const { width, height } = useWindowDimensions();
  const bg = useImage(require("../assets/sprites/background-day.png"));
  const bird = useImage(require("../assets/sprites/yellowbird-upflap.png"));
  const pipeBottom = useImage(require("../assets/sprites/pipe-green.png"));
  const pipeTop = useImage(require("../assets/sprites/pipe-green-top.png"));
  const base = useImage(require("../assets/sprites/base.png"));

  const x = useSharedValue(width);
  // const baseX = useSharedValue(x + 50);

  const birdY = useSharedValue(height / 3);
  const birdYVelocity = useSharedValue(0);

  const birdTransform = useDerivedValue(() => {
    return [
      {
        rotate: interpolate(
          birdYVelocity.value,
          [-500, 500],
          [-0.5, 0.5],
          Extrapolation.CLAMP
        ),
      },
    ];
  });

  const birdOrigin = useDerivedValue(() => {
    return { x: width / 4 + 32, y: birdY.value + 24 };
  });

  useFrameCallback(({ timeSincePreviousFrame: dt }) => {
    if (!dt) {
      return;
    }
    birdY.value = birdY.value + (birdYVelocity.value * dt) / 1000;
    birdYVelocity.value = birdYVelocity.value + (GRAVITY * dt) / 1000;
    // console.log("Velocity", birdYVelocity);
  });

  useEffect(() => {
    x.value = withRepeat(
      withSequence(
        withTiming(-150, { duration: 3000, easing: Easing.linear }),
        withTiming(width, { duration: 0 })
      ),
      -1 // Is going to repeat infinitely
    );
  }, []);
  const gesture = Gesture.Tap().onStart(() => {
    birdYVelocity.value = JUMP_FORCE;
  });

  const pipeOffset = 0;
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={gesture}>
        <Canvas style={{ width, height }}>
          <Image image={bg} width={width} height={height} fit={"cover"} />
          <Image
            image={pipeBottom}
            y={height - 320 + pipeOffset}
            x={x}
            width={103}
            height={640}
          />
          <Image
            image={pipeTop}
            y={pipeOffset - 320}
            x={x}
            width={103}
            height={640}
          />
          <Image
            image={base}
            width={width}
            height={150}
            y={height - 125}
            x={0}
            fit={"cover"}
          />
          <Group
            transform={birdTransform} // Bird rotation
            origin={birdOrigin}
          >
            <Image
              image={bird}
              y={birdY}
              x={width / 4}
              width={64}
              height={48}
            />
          </Group>
        </Canvas>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};
export default App;
