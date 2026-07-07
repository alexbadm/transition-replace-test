import {
  cloneElement,
  FC,
  ReactElement,
  useEffect,
  useRef,
  useState,
} from "react";
import "./TransitionContainer.css";

/**
 * Описание алгоритма TransitionContainer
 *
 * TransitionContainer при монтировании получает элемент-потомок, отрисовывает как обычно.
 * В prevChildren записывается копия children, показываем копию.
 *        container - height:auto
 *        transitionPrevNode - position:static, opacity:1
 *        transitionNode - position:static, opacity:0, display:none
 * При изменении потомка:
 *   1. контейнеру присваивается высота предыдущего потомка, а position у потомков становится absolute
 *        container - static height
 *        transitionPrevNode - position:absolute, opacity:1
 *        transitionNode - position:absolute, opacity:0, display:block
 *   2. предыдущему потомку плавно меняется opacity 1->0, а новому потомку плавно меняется opacity 0->1,
 *      а высота контейнера плавно меняется к значению высоты нового потомка
 *        container - static height (new value)
 *        transitionPrevNode - position:absolute, opacity:0
 *        transitionNode - position:absolute, opacity:1, display:block
 *   3. после завершения анимации записываем копию children, его position становится static, а высота контейнера auto
 *        container - height:auto
 *        transitionPrevNode - position:static, opacity:1
 *        transitionNode - position:static, opacity:0, display:none
 */

const defaultDuration = 600;

interface TransitionContainerProps {
  children: ReactElement;
  duration?: number;
}

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

  useEffect(() => {
    setState((prev) => {
      return prev.status !== "END" || prev.prevChildren.key !== children.key
        ? {
            ...prev,
            containerHeight: prevNodeRef.current?.scrollHeight,
            status: "START",
          }
        : prev;
    });
  }, [children]);

  useEffect(() => {
    if (state.status === "START") {
      setState((prev) => ({
        ...prev,
        containerHeight: nodeRef.current?.scrollHeight,
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
          transitionDuration: `${state.status === "END" ? 0 : duration}ms`,
          opacity: Number(state.status !== "TRANSITIONING"),
          position: state.status === "END" ? "static" : "absolute",
        }}
      >
        {state.prevChildren}
      </div>
      <div
        ref={nodeRef}
        className="transitionNode"
        style={{
          transitionDuration: `${state.status === "END" ? 0 : duration}ms`,
          opacity: Number(state.status === "TRANSITIONING"),
          display: state.status === "END" ? "none" : "block",
        }}
      >
        {children}
      </div>
    </div>
  );
};
