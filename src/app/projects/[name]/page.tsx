'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  StatusBadge,
  VulnTable,
  ContainerList,
  EventLog,
  ReportList,
  EnvInfoPanel,
} from '@/components/audit';
import { useWebSocket } from '@/hooks/useWebSocket';
import {
  getProjectDetail,
  startProject,
  cancelProject,
} from '@/lib/api';
import type {
  ProjectDetail,
  ContainerStruct,
  VulnStruct,
  ReportListStruct,
  EnvStruct,
  VulnStatusUpdate,
  ContainerRemove,
} from '@/lib/types';
import { toast } from 'sonner';

export default function ProjectDetailPage() {
  const params = useParams();
  const projectName = decodeURIComponent(params.name as string);

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [currentAction, setCurrentAction] = useState<'full' | 'analysis' | null>(null);

  // 实时数据状态
  const [vulnList, setVulnList] = useState<VulnStruct[]>([]);
  const [containerList, setContainerList] = useState<ContainerStruct[]>([]);
  const [eventLog, setEventLog] = useState<string[]>([]);
  const [reportList, setReportList] = useState<ReportListStruct>({});
  const [envInfo, setEnvInfo] = useState<EnvStruct | null>(null);

  // WebSocket 回调
  const wsCallbacks = useMemo(
    () => ({
      onEventLog: (event: string) => {
        setEventLog((prev) => [...prev, event]);
      },
      onReportAdd: (reports: ReportListStruct) => {
        setReportList((prev) => ({ ...prev, ...reports }));
      },
      onVulnStatus: (update: VulnStatusUpdate) => {
        setVulnList((prev) =>
          prev.map((v) =>
            v.vuln_id === update.vuln_id ? { ...v, status: update.status } : v
          )
        );
      },
      onVulnAdd: (vuln: VulnStruct) => {
        // 防止添加重复的漏洞
        setVulnList((prev) => {
          if (prev.some((v) => v.vuln_id === vuln.vuln_id)) {
            return prev;
          }
          return [...prev, vuln];
        });
      },
      onContainerAdd: (container: ContainerStruct) => {
        setContainerList((prev) => [...prev, container]);
      },
      onContainerRemove: (data: ContainerRemove) => {
        setContainerList((prev) =>
          prev.filter((c) => c.containerId !== data.containerId)
        );
      },
      onEnvInfo: (env: EnvStruct) => {
        setEnvInfo(env);
      },
      onProjectStatus: (status: string) => {
        // 更新项目状态
        setProject((prev) => prev ? { ...prev, status } : prev);
      },
    }),
    []
  );

  // 只有在项目运行中时才启用 WebSocket
  const isProjectRunning = project?.status === '运行中' || project?.status === '正在运行';
  const { isConnected } = useWebSocket(wsCallbacks, {
    enabled: !!isProjectRunning,
    autoReconnect: !!isProjectRunning,
    projectName: projectName, // 订阅当前项目的事件
  });

  // 加载项目详情
  const loadProject = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getProjectDetail(projectName);
      if (result.success && result.result) {
        setIsAuthenticated(true);
        setProject(result.result);
        setVulnList(result.result.vulnList || []);
        setContainerList(result.result.containerList || []);
        setEventLog(result.result.eventLog || []);
        setReportList(result.result.reportList || {});
        setEnvInfo(result.result.EnvInfo || null);
      } else {
        toast.error(result.error || '加载项目失败');
      }
    } catch {
      toast.error('加载项目失败');
    } finally {
      setIsLoading(false);
    }
  }, [projectName]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  // 启动项目（全流程）
  const handleStart = async () => {
    if (isActionLoading) return; // 防止重复提交
    setCurrentAction('full');
    setIsActionLoading(true);
    try {
      const result = await startProject(projectName, 0);
      if (result.success) {
        toast.success('项目开始运行');
        // 乐观更新状态为正在运行
        setProject((prev) => prev ? { ...prev, status: '正在运行' } : prev);
      } else {
        toast.error(result.error || '启动失败');
        // 启动失败时刷新获取真实状态
        await loadProject();
      }
    } catch {
      toast.error('启动失败');
    } finally {
      setIsActionLoading(false);
      setCurrentAction(null);
    }
  };

  // 启动项目（仅代码分析）
  const handleStartAnalysis = async () => {
    if (isActionLoading) return; // 防止重复提交
    setCurrentAction('analysis');
    setIsActionLoading(true);
    try {
      const result = await startProject(projectName, 1);
      if (result.success) {
        toast.success('已启动仅代码分析');
        // 乐观更新状态为正在运行
        setProject((prev) => prev ? { ...prev, status: '正在运行' } : prev);
      } else {
        toast.error(result.error || '启动失败');
        // 启动失败时刷新获取真实状态
        await loadProject();
      }
    } catch {
      toast.error('启动失败');
    } finally {
      setIsActionLoading(false);
      setCurrentAction(null);
    }
  };

  // 取消项目
  const handleCancel = async () => {
    if (isActionLoading) return; // 防止重复提交
    if (!confirm('确定要取消运行吗？')) return;

    setIsActionLoading(true);
    try {
      const result = await cancelProject(projectName);
      if (result.success) {
        toast.success('项目已取消运行');
        loadProject();
      } else {
        toast.error(result.error || '取消失败');
      }
    } catch {
      toast.error('取消失败');
    } finally {
      setIsActionLoading(false);
    }
  };

  // 统一使用相同的状态判断逻辑
  const isRunning = project?.status === '运行中' || project?.status === '正在运行';

  // 未认证时显示白色空白页面
  if (!isAuthenticated) {
    return <div style={{ position: 'fixed', inset: 0, backgroundColor: '#fff', zIndex: 9999 }} />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
            <Skeleton className="h-8 w-48 md:w-64 bg-muted" />
          </div>
        </header>
        <main className="container mx-auto px-4 md:px-6 py-6 md:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-64 bg-muted rounded-lg" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-40 bg-muted rounded-lg" />
              <Skeleton className="h-40 bg-muted rounded-lg" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3 md:gap-4 min-w-0">
              <Link
                href="/"
                className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m12 19-7-7 7-7" />
                  <path d="M19 12H5" />
                </svg>
              </Link>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                  <h1 className="text-lg md:text-xl font-bold truncate max-w-[200px] sm:max-w-none">{projectName}</h1>
                  <StatusBadge status={project?.status || '未运行'} />
                  {isConnected && (
                    <span className="flex items-center gap-1 text-xs text-cyber-green">
                      <span className="status-indicator running" />
                      <span className="hidden sm:inline">实时连接</span>
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 md:gap-4 text-xs text-muted-foreground mt-1 flex-wrap">
                  {project?.startTime && (
                    <span>开始: {project.startTime}</span>
                  )}
                  {project?.endTime && (
                    <span>结束: {project.endTime}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {!isRunning ? (
                <>
                  <Button
                    className="bg-cyber-green text-background hover:bg-cyber-green/90 flex-1 sm:flex-none"
                    onClick={handleStart}
                    disabled={isActionLoading}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="sm:mr-2"
                    >
                      <polygon points="6 3 20 12 6 21 6 3" />
                    </svg>
                    <span className="hidden sm:inline">{currentAction === 'full' && isActionLoading ? '启动中...' : '启动审计'}</span>
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleStartAnalysis}
                    disabled={isActionLoading}
                    className="flex-1 sm:flex-none"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="sm:mr-2"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <line x1="10" y1="9" x2="8" y2="9" />
                    </svg>
                    <span className="hidden sm:inline">{currentAction === 'analysis' && isActionLoading ? '分析中...' : '仅代码分析'}</span>
                  </Button>
                </>
              ) : project?.status !== '已完成' ? (
                <Button
                  variant="destructive"
                  onClick={handleCancel}
                  disabled={isActionLoading}
                  className="flex-1 sm:flex-none"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="sm:mr-2"
                  >
                    <rect width="14" height="14" x="5" y="5" rx="2" />
                  </svg>
                  <span className="hidden sm:inline">{isActionLoading ? '取消中...' : '取消运行'}</span>
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 md:px-6 py-4 md:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Left Panel - Vulnerabilities & Event Log */}
          <div className="lg:col-span-2 space-y-4">
            {/* 漏洞列表 */}
            <div className="cyber-card rounded-lg">
              <div className="p-3 md:p-4 border-b border-border/30">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h2 className="font-semibold flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-cyber-red"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <path d="M12 8v4" />
                      <path d="M12 16h.01" />
                    </svg>
                    漏洞列表
                  </h2>
                  <span className="text-sm text-muted-foreground">
                    共 <span className="text-cyber-red font-semibold">{vulnList.length}</span> 个漏洞
                  </span>
                </div>
              </div>
              <div className="p-2 md:p-4">
                <VulnTable vulns={vulnList} maxHeight="500px" />
              </div>
            </div>

            {/* 事件日志 */}
            <EventLog events={eventLog} maxHeight="360px" />
          </div>

          {/* Right Panel */}
          <div>
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="w-full grid grid-cols-2 bg-muted/50 h-10">
                <TabsTrigger value="info">环境信息</TabsTrigger>
                <TabsTrigger value="reports">报告</TabsTrigger>
              </TabsList>
              <TabsContent value="info" className="space-y-4 mt-2">
                <ContainerList containers={containerList} />
                <EnvInfoPanel envInfo={envInfo} maxHeight="640px" />
              </TabsContent>
              <TabsContent value="reports" className="mt-2">
                <ReportList projectName={projectName} reports={reportList} maxHeight="780px" />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
