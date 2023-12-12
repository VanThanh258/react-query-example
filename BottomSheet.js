import Portal from '@lib/Portal';
import { HEIGHT, WIDTH } from '@theme/scale';
import React, {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';
import {
    BackHandler,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
} from 'react-native';
import Animated, {
    Easing,
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedKeyboardAvoidingView =
    Animated.createAnimatedComponent(KeyboardAvoidingView);

// Only use this component wrapped inside a <Portal.Host> component.
// <Portal.Host> component should be inside a full screen component.

const springConfig = {
    damping: 32,
    stiffness: 200,
    mass: 2,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
};

const BottomSheet = forwardRef(
    (
        {
            lazyLoad = true,
            unmountOnHide = false,
            animationTimeIn = 500,
            animationTimeOut = 400,
            bottomSheetStyle = {},
            onPressBackdrop,
            onAnimatedOpenEnd = () => {},
            onAnimatedCloseEnd = () => {},
            children,
            // A props for modal contain input so that we can click outside to hide keyboard.
            containInputControlKeyboard = false,
        },
        ref,
    ) => {
        const [isReady, setIsReady] = useState(!lazyLoad && !unmountOnHide);
        const animateModal = useSharedValue(1);
        const displayModal = useSharedValue(0);
        const willOpenModal = useRef(false);

        useEffect(() => {
            return () =>
                BackHandler.removeEventListener(
                    'hardwareBackPress',
                    onBackPress,
                );
        }, []);

        useLayoutEffect(() => {
            if (isReady && willOpenModal.current) {
                requestAnimationFrame(() => animatedOpenModal());
            }
            willOpenModal.current = false;
        }, [isReady]);

        useImperativeHandle(ref, () => ({
            open: () => {
                if (!isReady) {
                    willOpenModal.current = true;
                    setIsReady(true);
                    return;
                }
                requestAnimationFrame(() => animatedOpenModal());
            },
            close: () => {
                requestAnimationFrame(() => animatedCloseModal());
            },
        }));

        const onBackPress = useCallback(() => {
            animatedCloseModal();
            return true;
        }, []);

        const animatedOpenModal = () => {
            displayModal.value = 1;
            animateModal.value = withTiming(
                0,
                {
                    easing: Easing.bezier(0.51, 0.13, 0.05, 1.13),
                    duration: animationTimeIn,
                },
                () => {
                    runOnJS(onAnimatedOpenEnd)();
                },
            );
            BackHandler.addEventListener('hardwareBackPress', onBackPress);
        };

        const animatedCloseModal = () => {
            animateModal.value = withTiming(
                1,
                { duration: animationTimeOut },
                () => {
                    displayModal.value = 0;
                    runOnJS(onAnimatedCloseEnd)();
                    unmountOnHide && runOnJS(setIsReady)(false);
                },
            );
            Keyboard.dismiss();
            BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        };

        const modalAnimated = useAnimatedStyle(() => {
            return {
                transform: [
                    {
                        translateY: animateModal.value * HEIGHT,
                    },
                ],
            };
        });

        const backDropAnimated = useAnimatedStyle(() => ({
            opacity: interpolate(animateModal.value, [0, 0.8], [1, 0]),
        }));

        const containerStyle = useAnimatedStyle(() => {
            return Platform.OS == 'ios'
                ? {
                      transform: [
                          {
                              scale: displayModal.value,
                          },
                      ],
                  }
                : {
                      transform: [
                          {
                              translateX: (1 - displayModal.value) * WIDTH * 2,
                          },
                      ],
                      //   width: displayModal.value == 1 ? "100%" : "0%",
                      //   height: displayModal.value == 1 ? "100%" : "0%",
                  };
        });

        return (
            <Portal>
                <AnimatedKeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={[styles.modalContainer, containerStyle]}
                >
                    <AnimatedPressable
                        style={[styles.backdrop, backDropAnimated]}
                        onPress={() => {
                            onPressBackdrop
                                ? onPressBackdrop()
                                : animatedCloseModal();
                        }}
                    />
                    <Animated.View
                        onStartShouldSetResponder={() =>
                            containInputControlKeyboard
                        }
                        onResponderRelease={
                            containInputControlKeyboard
                                ? Keyboard.dismiss
                                : undefined
                        }
                        style={[styles.modal, bottomSheetStyle, modalAnimated]}
                    >
                        {isReady && children}
                    </Animated.View>
                </AnimatedKeyboardAvoidingView>
            </Portal>
        );
    },
);

export default BottomSheet;

const styles = StyleSheet.create({
    modalContainer: {
        ...StyleSheet.absoluteFill,
        overflow: 'hidden',
        backgroundColor: 'transparent',
    },
    backdrop: {
        ...StyleSheet.absoluteFill,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modal: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
        transform: [
            {
                translateY: 0,
            },
        ],
    },
});
