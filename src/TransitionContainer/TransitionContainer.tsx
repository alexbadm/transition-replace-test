import {
  cloneElement,
  FC,
  ReactElement,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import "./TransitionContainer.css";

/**
 * Описание алгоритма TransitionContainer
 *
 * TransitionContainer при монтировании получает элемент-потомок, отрисовывает как обычно.
 * В prevChildren записывается копия children, но показываем children. В случае перерисовки глубоко
 * в потомке мы это не увидим, и будем показывать устаревшую копию.
 *        container - height:auto
 *        transitionPrevNode - position:absolute, opacity:0
 *        transitionNode - position:static, opacity:1
 *        transitionDuration: 0ms
 *        status: END
 * При изменении потомка:
 *   1. контейнеру присваивается высота предыдущего потомка, а position у потомков становится absolute
 *        container - static height
 *        transitionPrevNode - position:absolute, opacity:1
 *        transitionNode - position:absolute, opacity:0
 *        transitionDuration: 0ms
 *        status: START
 *   2. предыдущему потомку плавно меняется opacity 1->0, а новому потомку плавно меняется opacity 0->1,
 *      а высота контейнера плавно меняется к значению высоты нового потомка
 *        container - static height (new value)
 *        transitionPrevNode - position:absolute, opacity:0
 *        transitionNode - position:absolute, opacity:1
 *        transitionDuration: {duration}ms
 *        status: TRANSITIONING
 *   3. после завершения анимации записываем копию children, position у children становится static, а высота контейнера auto
 *        container - height:auto
 *        transitionPrevNode - position:absolute, opacity:0
 *        transitionNode - position:static, opacity:1
 *        transitionDuration: 0ms
 *        status: END
 */

const defaultDuration = 600;

interface TransitionContainerProps {
  /**
   * Сменяемый элемент-потомок. Обязательно должен иметь уникальный `key`!
   */
  children: ReactElement;
  /**
   * Продолжительность анимации в миллисекундах.
   * @default 600
   */
  duration?: number;
}

/**
 * TransitionContainer используется для плавной смены компонента на странице.
 * Принимает один единственный children элемент, который может быть заменёт другим.
 *
 * Важно! Для работы плавной смены потомка, сменяемые потомки должны иметь уникальные `key`!
 *
 * @example
 *
 * <TransitionContainer duration={1600}>
 *   {state === "alpha" ? (
 *     <ComponentAlpha key="alpha" />
 *   ) : state === "beta" ? (
 *     <ComponentBeta key="beta" />
 *   ) : (
 *     <ComponentGamma key="gamma" />
 *   )}
 * </TransitionContainer>
 *
 * @kind component
 */
export const TransitionContainer: FC<TransitionContainerProps> = ({
  children,
  duration = defaultDuration,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const prevNodeRef = useRef<HTMLDivElement>(null);
  const nodeRef = useRef<HTMLDivElement>(null);

  const [state, setState] = useState<{
    containerHeight: number | undefined;
    prevChildren: ReactElement;
    status: "START" | "TRANSITIONING" | "END";
  }>(() => ({
    containerHeight: undefined,
    prevChildren: cloneElement(children),
    status: "END",
  }));

  useLayoutEffect(() => {
    setState((prev) => {
      return prev.status !== "END" || prev.prevChildren.key !== children.key
        ? {
            ...prev,
            containerHeight:
              prevNodeRef.current?.getBoundingClientRect().height,
            status: "START",
          }
        : prev;
    });
  }, [children]);

  useEffect(() => {
    if (state.status === "START") {
      setState((prev) => ({
        ...prev,
        containerHeight: nodeRef.current?.getBoundingClientRect().height,
        status: "TRANSITIONING",
      }));
    } else if (state.status === "TRANSITIONING") {
      const timer = setTimeout(() => {
        setState((prev) => ({
          ...prev,
          containerHeight: undefined,
          prevChildren: cloneElement(children),
          status: "END",
        }));
      }, duration);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [children, duration, state.status]);

  return (
    <div
      className="transitionContainer"
      ref={containerRef}
      style={{
        height: state.containerHeight,
        transitionDuration: `${duration}ms`,
      }}
    >
      <div
        ref={prevNodeRef}
        className="transitionPrevNode"
        style={{
          transitionDuration: `${state.status === "TRANSITIONING" ? duration : 0}ms`,
          opacity: Number(state.status === "START"),
        }}
      >
        {state.prevChildren}
      </div>
      <div
        ref={nodeRef}
        className="transitionNode"
        style={{
          transitionDuration: `${state.status === "TRANSITIONING" ? duration : 0}ms`,
          opacity: Number(state.status !== "START"),
          position: state.status === "END" ? "static" : "absolute",
        }}
      >
        {children}
      </div>
    </div>
  );
};
