/**
 * Conflict Resolution Modal
 *
 * Modal for manually resolving sync conflicts
 */

import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useState } from 'react';
import { useConflicts } from '@/hooks/useConflicts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Conflict, ConflictResolution } from '@/conflict/types';
import type { Language } from '@/db/schema';

interface ConflictResolutionModalProps {
  language: Language;
  theme: 'light' | 'dark';
  isOpen: boolean;
  onClose: () => void;
}

export function ConflictResolutionModal({ language, theme, isOpen, onClose }: ConflictResolutionModalProps) {
  const { pendingConflicts, resolveConflict, resolveAllWithStrategy, getConflictInfo } = useConflicts();
  const [selectedConflictId, setSelectedConflictId] = useState<string | null>(null);
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());

  const getText = (zh: string, en: string) => (language === 'zh' ? zh : en);

  const selectedConflict = pendingConflicts.find((c) => c.id === selectedConflictId);
  const conflictInfo = selectedConflict ? getConflictInfo(selectedConflict) : null;

  const handleResolve = async (conflictId: string, resolution: ConflictResolution) => {
    await resolveConflict(conflictId, resolution);
    setResolvedIds(new Set(resolvedIds).add(conflictId));
    setSelectedConflictId(null);
  };

  const handleResolveAll = async (strategy: 'LAST_WRITE_WINS' | 'SERVER_WINS' | 'CLIENT_WINS') => {
    await resolveAllWithStrategy(strategy);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[300]"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[310] flex items-end sm:items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-2xl shadow-2xl bg-card text-card-foreground"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <AlertCircle size={20} className="text-amber-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">
                      {getText('解决同步冲突', 'Resolve Sync Conflicts')}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {getText(
                        `${pendingConflicts.length} 条记录需要处理`,
                        `${pendingConflicts.length} record${pendingConflicts.length > 1 ? 's' : ''} to resolve`
                      )}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-accent/50 transition-colors"
                >
                  <X size={20} className="text-muted-foreground" />
                </button>
              </div>

              {/* Content */}
              <div className="overflow-y-auto max-h-[60vh] p-4 space-y-3">
                {/* Quick resolve buttons */}
                {pendingConflicts.length > 1 && (
                  <div className="p-4 rounded-xl bg-muted/30 border border-border">
                    <div className="flex items-center gap-2 mb-3">
                      <Info size={16} className="text-blue-500" />
                      <span className="text-sm font-medium">
                        {getText('批量解决', 'Batch Resolve')}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResolveAll('LAST_WRITE_WINS')}
                        className="text-xs"
                      >
                        {getText('最新优先', 'Latest Wins')}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResolveAll('SERVER_WINS')}
                        className="text-xs"
                      >
                        {getText('服务器优先', 'Server Wins')}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResolveAll('CLIENT_WINS')}
                        className="text-xs"
                      >
                        {getText('本地优先', 'Client Wins')}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Conflict list */}
                {pendingConflicts.map((conflict) => (
                  <div
                    key={conflict.id}
                    onClick={() => setSelectedConflictId(conflict.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedConflictId === conflict.id
                        ? 'border-amber-500 bg-amber-500/5'
                        : 'bg-card border-border hover:border-border/80'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">
                          {conflict.entityType}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {conflict.id.slice(0, 8)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-amber-600">
                        <Clock size={12} />
                        {new Date(conflict.createdAt).toLocaleString()}
                      </div>
                    </div>

                    {/* Show conflict details if selected */}
                    {selectedConflictId === conflict.id && conflictInfo && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="mt-3 pt-3 border-t space-y-3 border-border"
                      >
                        {/* Client version */}
                        <div>
                          <div className="text-xs font-medium mb-1 text-blue-500">
                            {getText('本地版本', 'Local Version')}
                          </div>
                          <div className="p-2 rounded-lg bg-muted/30">
                            {conflict.entityType === 'meal' && (
                              <>
                                <div className="text-sm font-medium">
                                  {(conflictInfo as any).clientChanges?.foodName || getText('未知食物', 'Unknown')}
                                </div>
                                <div className="text-xs mt-1 text-muted-foreground">
                                  {getText('更新时间', 'Updated')}: {new Date(conflict.clientUpdatedAt).toLocaleString()}
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Server version */}
                        <div>
                          <div className="text-xs font-medium mb-1 text-green-500">
                            {getText('服务器版本', 'Server Version')}
                          </div>
                          <div className="p-2 rounded-lg bg-muted/30">
                            {conflict.entityType === 'meal' && (
                              <>
                                <div className="text-sm font-medium">
                                  {(conflictInfo as any).serverChanges?.foodName || getText('未知食物', 'Unknown')}
                                </div>
                                <div className="text-xs mt-1 text-muted-foreground">
                                  {getText('更新时间', 'Updated')}: {new Date(conflict.serverUpdatedAt).toLocaleString()}
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Resolution buttons */}
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleResolve(conflict.id, { strategy: 'MANUAL', keepVersion: 'CLIENT' });
                            }}
                            className="text-xs"
                          >
                            {getText('使用本地', 'Keep Local')}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleResolve(conflict.id, { strategy: 'MANUAL', keepVersion: 'SERVER' });
                            }}
                            className="text-xs"
                          >
                            {getText('使用服务器', 'Keep Server')}
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                ))}

                {/* Empty state */}
                {pendingConflicts.length === 0 && (
                  <div className="py-12 text-center">
                    <CheckCircle2 size={48} className="mx-auto mb-3 text-green-500" />
                    <p className="text-lg font-medium">
                      {getText('没有冲突', 'No Conflicts')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {getText('所有数据已同步', 'All data is synchronized')}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              {pendingConflicts.length > 0 && (
                <div className="p-4 border-t border-border flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">
                    {getText(
                      '选择要查看的冲突详情',
                      'Select a conflict to view details'
                    )}
                  </p>
                  <Button onClick={onClose} size="sm">
                    {getText('完成', 'Done')}
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
