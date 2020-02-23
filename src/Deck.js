import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  LayoutAnimation,
  UIManager
} from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.4;
const SWIPE_OUT_DURATION = 250;

UIManager.setLayoutAnimationEnabledExperimental &&
  UIManager.setLayoutAnimationEnabledExperimental(true);

const Deck = props => {
  LayoutAnimation.spring();
  const data = props.data;
  const renderCard = props.renderCard;
  const renderNoMoreCards = props.renderNoMoreCards;
  const [index, setIndex] = useState(0);

  const resetPosition = position => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 }
    }).start();
  };

  useEffect(() => {
    setIndex(0);
  }, [data]);

  useEffect(() => {
    LayoutAnimation.spring();
  }, []);

  const onSwipeComplete = (props, index, position, callback) => {
    const { data } = props;
    const item = data[index - 1];
    callback(item);
    position.setValue({ x: 0, y: 0 });
    setIndex(index + 1);
  };

  const forceSwipe = (direction, position, props, index) => {
    const x = direction === "right" ? SCREEN_WIDTH : -SCREEN_WIDTH;
    Animated.timing(position, {
      toValue: { x: SCREEN_WIDTH, y: 0 },
      duration: SWIPE_OUT_DURATION
    }).start(onSwipeComplete(props, index, position, () => {}));
  };

  const position = new Animated.ValueXY();
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (event, gesture) => {
      position.setValue({ x: gesture.dx, y: gesture.dy });
    },
    onPanResponderRelease: (event, gesture) => {
      if (gesture.dx > SWIPE_THRESHOLD) {
        forceSwipe("right", position, props, index);
      } else if (gesture.dx < -SWIPE_THRESHOLD) {
        forceSwipe("left", position, props, index);
      } else {
        resetPosition(position);
      }
    }
  });

  const getCardStyle = () => {
    const rotate = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
      outputRange: ["-120deg", "0deg", "120deg"]
    });

    return {
      ...position.getLayout(),
      transform: [{ rotate }]
    };
  };

  const renderCards = data => {
    if (index >= data.length) {
      return renderNoMoreCards();
    }

    return data
      .map((item, i) => {
        if (i < index) {
          return null;
        }
        if (i === index) {
          return (
            <Animated.View
              key={item.id}
              style={[getCardStyle(), styles.cardStyle, { zIndex: 99 }]}
              {...panResponder.panHandlers}
            >
              {renderCard(item)}
            </Animated.View>
          );
        } else {
          return (
            <Animated.View
              key={item.id}
              style={[styles.cardStyle, { top: 10 * (i - index), zIndex: 5 }]}
            >
              {renderCard(item)}
            </Animated.View>
          );
        }
      })
      .reverse();
  };
  return <View>{renderCards(data)}</View>;
};

const styles = {
  cardStyle: {
    position: "absolute",
    width: SCREEN_WIDTH
  }
};

export default Deck;
