import { FC, PropsWithChildren, useEffect, useRef, useState } from "react";
import "./TransitionContainer.css";
import {
  Transition,
  SwitchTransition,
  TransitionStatus,
} from "react-transition-group";

const isHTMLElement = (node: Node): node is Element =>
  node.nodeType === Node.ELEMENT_NODE;

// const isHTMLDivElement = (node: Node): node is HTMLDivElement =>
//   isHTMLElement(node) && node.tagName === "DIV";

const defaultDuration = 600;
const transitionStatusOpacity: Record<TransitionStatus, number> = {
  entering: 0,
  entered: 1,
  exiting: 0,
  exited: 0,
  unmounted: 0,
};

interface TransitionContainerProps extends PropsWithChildren {
  duration?: number;
  hash: string;
}

export const TransitionContainer: FC<TransitionContainerProps> = ({
  children,
  duration = defaultDuration,
  hash,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState<number>();
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const callback: MutationCallback = (mutationList, observer) => {
      for (const mutation of mutationList) {
        if (mutation.type !== "childList") {
          return;
        }

        const addedNode = mutation.addedNodes.item(0);
        if (addedNode) {
          if (isHTMLElement(addedNode)) {
            setContainerHeight(addedNode.scrollHeight);
          }
        }

        const removedNode = mutation.removedNodes.item(0);
        if (removedNode) {
          setIsTransitioning(false);
        }
      }
    };

    const observer = new MutationObserver(callback);
    observer.observe(containerRef.current, { childList: true });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      className="transitionContainer"
      ref={containerRef}
      style={{
        height: containerHeight,
        transitionDuration: `${duration}ms`,
      }}
    >
      <SwitchTransition mode="in-out">
        <Transition
          //   addEndListener={(done) => {
          //     nodeRef.current?.addEventListener("transitionend", done);
          //   }}
          key={hash}
          nodeRef={nodeRef}
          onEnter={() => {
            setIsTransitioning(true);
          }}
          timeout={duration}
        >
          {(transitionState) => (
            <div
              ref={nodeRef}
              className="transitionNode"
              style={{
                transitionDuration: `${duration}ms`,
                opacity: transitionStatusOpacity[transitionState],
                position: isTransitioning ? "absolute" : "static",
              }}
            >
              {children}
            </div>
          )}
        </Transition>
      </SwitchTransition>
    </div>
  );
};
