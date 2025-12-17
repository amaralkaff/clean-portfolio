import { useRef, useEffect, useState } from 'react';

interface FadeContentProps {
    children: React.ReactNode;
    blur?: boolean;
    duration?: number;
    easing?: string;
    threshold?: number;
    initialOpacity?: number;
    className?: string;
}

const FadeContent = ({
    children,
    blur = false,
    duration = 1000,
    easing = 'ease-out',
    threshold = 0.1,
    initialOpacity = 0,
    className = '',
}: FadeContentProps) => {
    const [inView, setInView] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    observer.disconnect();
                }
            },
            { threshold }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, [threshold]);

    return (
        <div
            ref={ref}
            className={className}
            style={{
                opacity: inView ? 1 : initialOpacity,
                transition: `opacity ${duration}ms ${easing}, filter ${duration}ms ${easing}`,
                filter: blur ? (inView ? 'blur(0px)' : 'blur(10px)') : 'none',
                willChange: 'opacity, filter',
            }}
        >
            {children}
        </div>
    );
};

export default FadeContent;
