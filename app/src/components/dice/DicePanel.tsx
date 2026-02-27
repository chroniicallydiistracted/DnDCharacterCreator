/**
 * DicePanel - Wrapper component for DiceRoller with quick-roll buttons
 * 
 * Provides a modal interface for rolling dice with common D&D dice presets.
 */

import { useRef, useState, useEffect, useCallback } from 'react';
import { DiceRoller, type DiceRollerRef, type DiceRollResult } from './DiceRoller';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';

interface DicePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onRollComplete?: (result: DiceRollResult, label?: string) => void;
  /** Pre-fill expression and optionally auto-roll */
  initialExpression?: string;
  autoRoll?: boolean;
  /** Label for context (e.g., "Attack Roll", "Damage") */
  label?: string;
}

const QUICK_DICE = [
  { label: 'd4', expr: '1d4' },
  { label: 'd6', expr: '1d6' },
  { label: 'd8', expr: '1d8' },
  { label: 'd10', expr: '1d10' },
  { label: 'd12', expr: '1d12' },
  { label: 'd20', expr: '1d20' },
  { label: 'd100', expr: '1d100' },
  { label: '2d6', expr: '2d6' },
  { label: '4d6', expr: '4d6' },
];

export function DicePanel({
  isOpen,
  onClose,
  onRollComplete,
  initialExpression = '1d20',
  autoRoll = false,
  label,
}: DicePanelProps) {
  const rollerRef = useRef<DiceRollerRef>(null);
  const [expression, setExpression] = useState(initialExpression);
  const [isRolling, setIsRolling] = useState(false);
  const [lastResult, setLastResult] = useState<DiceRollResult | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [viewport, setViewport] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1600,
    height: typeof window !== 'undefined' ? window.innerHeight : 900,
  }));
  const didAutoRollRef = useRef(false);

  useEffect(() => {
    if (!isOpen) return;
    const onResize = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };

    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [isOpen]);

  // Update expression when initialExpression changes
  useEffect(() => {
    setExpression(initialExpression);
  }, [initialExpression]);

  const doRoll = useCallback(async (expr?: string) => {
    const target = expr ?? expression;
    if (!target || !rollerRef.current || isRolling || !isReady) return;

    setIsRolling(true);
    try {
      const result = await rollerRef.current.roll(target);
      setLastResult(result);
      onRollComplete?.(result, label);
    } catch (err) {
      console.error('Roll error:', err);
    } finally {
      setIsRolling(false);
    }
  }, [expression, isRolling, isReady, onRollComplete, label]);

  // Auto-roll when modal opens with autoRoll flag
  useEffect(() => {
    if (isOpen && autoRoll && initialExpression && isReady && !didAutoRollRef.current) {
      didAutoRollRef.current = true;
      const timer = setTimeout(() => {
        doRoll(initialExpression);
      }, 100);
      return () => clearTimeout(timer);
    }
    if (!isOpen) {
      didAutoRollRef.current = false;
      setIsReady(false);
    }
  }, [isOpen, autoRoll, initialExpression, isReady, doRoll]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      doRoll();
    }
  };

  // Reset state when modal closes
  const handleClose = () => {
    didAutoRollRef.current = false;
    setLastResult(null);
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      title={label ? `🎲 ${label}` : '🎲 Dice Roller'}
      size="full"
    >
      <div className="flex flex-col gap-4 h-[calc(85vh-120px)]">
        {/* Dice Roller Canvas */}
        <div className="flex justify-center flex-1 min-h-0">
          <DiceRoller
            ref={rollerRef}
            width={Math.min(viewport.width * 0.92, 1600)}
            height={Math.min(viewport.height * 0.72, 900)}
            onRollStart={() => setIsRolling(true)}
            onReadyChange={setIsReady}
          />
        </div>

        {/* Expression Input */}
        <div className="flex gap-2">
          <Input
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., 2d6+5"
            className="flex-1 font-mono"
            disabled={isRolling}
          />
          <Button
            onClick={() => doRoll()}
            disabled={isRolling || !expression || !isReady}
            variant="primary"
          >
            {!isReady ? 'Loading…' : isRolling ? 'Rolling…' : 'Roll'}
          </Button>
        </div>

        {/* Quick Dice Buttons */}
        <div className="flex flex-wrap gap-2 justify-center">
          {QUICK_DICE.map((d) => (
            <Button
              key={d.expr}
              variant="ghost"
              size="sm"
              onClick={() => {
                setExpression(d.expr);
                doRoll(d.expr);
              }}
              disabled={isRolling || !isReady}
              className="min-w-[50px]"
            >
              {d.label}
            </Button>
          ))}
        </div>

        {/* Last Result Summary */}
        {lastResult && (
          <div className="mt-2 p-3 bg-dark-ink/40 rounded-lg text-center border border-gold/20">
            <div className="text-2xl font-bold font-display text-gold">
              {lastResult.total}
            </div>
            <div className="text-xs font-body text-stone mt-1">
              {lastResult.breakdown.join(' + ')}
              {lastResult.modifier !== 0 && (
                <span> {lastResult.modifier >= 0 ? '+' : ''}{lastResult.modifier}</span>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default DicePanel;
