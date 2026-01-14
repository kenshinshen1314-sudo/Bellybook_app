/**
 * SyncStatus Component
 *
 * Displays sync status and statistics in the settings view
 */

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
  Cloud,
  CloudOff,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import { useSync } from '@/hooks/useSync';
import type { Language } from '@/db/schema';

interface SyncStatusProps {
  userId: string;
  language: Language;
}

export function SyncStatus({ userId, language }: SyncStatusProps) {
  const { stats, processSync, abortSync, clearSync, isSyncing } = useSync({
    userId,
    autoSync: true,
  });

  const getText = (zh: string, en: string) => (language === 'zh' ? zh : en);

  const handleSync = async () => {
    if (isSyncing) {
      abortSync();
    } else {
      await processSync();
    }
  };

  const handleClear = async () => {
    if (
      confirm(
        language === 'zh'
          ? '确定要清空同步队列吗？这将删除所有待同步的项目。'
          : 'Clear sync queue? This will delete all pending sync items.'
      )
    ) {
      await clearSync();
    }
  };

  const getStatusIcon = () => {
    switch (stats.status) {
      case 'syncing':
        return <RefreshCw className="animate-spin" size={20} />;
      case 'success':
        return <CheckCircle2 size={20} />;
      case 'error':
        return <AlertCircle size={20} />;
      default:
        return <Cloud size={20} />;
    }
  };

  const getStatusText = () => {
    switch (stats.status) {
      case 'syncing':
        return getText('同步中...', 'Syncing...');
      case 'success':
        return getText('同步成功', 'Sync successful');
      case 'error':
        return getText('同步错误', 'Sync error');
      default:
        return getText('同步状态', 'Sync Status');
    }
  };

  const getStatusColor = () => {
    switch (stats.status) {
      case 'syncing':
        return 'text-blue-500';
      case 'success':
        return 'text-green-500';
      case 'error':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Card className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: isSyncing ? 360 : 0 }}
            transition={{ duration: 1, repeat: isSyncing ? Infinity : 0, ease: 'linear' }}
            className={getStatusColor()}
          >
            {getStatusIcon()}
          </motion.div>
          <h3 className="font-semibold text-lg">{getText('数据同步', 'Data Sync')}</h3>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={stats.pending === 0 && stats.failed === 0}
          >
            {isSyncing ? (
              <>
                <RefreshCw className="mr-1 animate-spin" size={14} />
                {getText('取消', 'Cancel')}
              </>
            ) : (
              <>
                <RefreshCw className="mr-1" size={14} />
                {getText('立即同步', 'Sync Now')}
              </>
            )}
          </Button>
          {(stats.pending > 0 || stats.failed > 0) && (
            <Button variant="ghost" size="sm" onClick={handleClear}>
              <Trash2 size={14} />
            </Button>
          )}
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-muted-foreground">{getStatusText()}</span>
        {stats.lastSyncTime && (
          <span className="text-xs text-muted-foreground">
            {getText('最后同步', 'Last sync')}: {new Date(stats.lastSyncTime).toLocaleString()}
          </span>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-3">
        {/* Pending */}
        <motion.div
          className="flex items-center gap-2 p-3 rounded-lg bg-muted/50"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <CloudOff className="text-amber-500" size={18} />
          <div>
            <div className="text-xs text-muted-foreground">{getText('待同步', 'Pending')}</div>
            <div className="text-lg font-semibold">{stats.pending}</div>
          </div>
        </motion.div>

        {/* Failed */}
        <motion.div
          className="flex items-center gap-2 p-3 rounded-lg bg-muted/50"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <AlertCircle className={stats.failed > 0 ? 'text-destructive' : 'text-muted-foreground'} size={18} />
          <div>
            <div className="text-xs text-muted-foreground">{getText('失败', 'Failed')}</div>
            <div className="text-lg font-semibold">{stats.failed}</div>
          </div>
        </motion.div>
      </div>

      {/* Queue info */}
      {stats.pending + stats.failed > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20"
        >
          <p className="text-xs text-amber-600 dark:text-amber-400">
            {language === 'zh'
              ? `您有 ${stats.pending + stats.failed} 项数据等待同步到服务器。请在连接到网络后点击"立即同步"按钮。`
              : `You have ${stats.pending + stats.failed} items waiting to sync. Connect to internet and tap "Sync Now".`}
          </p>
        </motion.div>
      )}

      {/* Empty state */}
      {stats.pending === 0 && stats.failed === 0 && (
        <div className="mt-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
          <CheckCircle2 className="mx-auto mb-1 text-green-500" size={20} />
          <p className="text-xs text-green-600 dark:text-green-400">
            {getText('所有数据已同步', 'All data is synced')}
          </p>
        </div>
      )}
    </Card>
  );
}
