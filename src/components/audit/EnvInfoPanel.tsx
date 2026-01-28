'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { EnvStruct } from '@/lib/types';

interface EnvInfoPanelProps {
  envInfo: EnvStruct | null;
  maxHeight?: string;
}

function InfoItem({ label, value, isMono = false }: { label: string; value?: string; isMono?: boolean }) {
  if (!value) return null;

  return (
    <div className="py-1">
      <div className="text-muted-foreground text-xs mb-0.5">{label}</div>
      <div className={`text-xs break-all ${isMono ? 'font-mono text-cyber-cyan' : ''}`}>{value}</div>
    </div>
  );
}

export function EnvInfoPanel({ envInfo, maxHeight = '350px' }: EnvInfoPanelProps) {
  if (!envInfo) {
    return (
      <Card className="cyber-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
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
              className="text-cyber-cyan"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            环境信息
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground text-sm text-center py-4">
            环境尚未搭建完成
          </div>
        </CardContent>
      </Card>
    );
  }

  const { loginInfo, dbInfo, routeInfo, containerId } = envInfo;
  const hasLoginInfo = loginInfo && (loginInfo.username || loginInfo.loginURL);
  const hasDbInfo = dbInfo && (dbInfo.Host || dbInfo.username);
  const hasRouteInfo = routeInfo && routeInfo.length > 0;

  return (
    <Card className="cyber-card overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
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
            className="text-cyber-cyan"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          环境信息
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 overflow-y-auto" style={{ maxHeight }}>
        <div className="p-4 pt-0 space-y-4">
            {containerId && (
              <InfoItem label="容器 ID" value={containerId.slice(0, 12)} isMono />
            )}

            {hasLoginInfo && (
              <div>
                <h4 className="text-xs font-medium text-cyber-green mb-2">登录信息</h4>
                <div className="space-y-1 pl-2 border-l-2 border-cyber-green/30">
                  <InfoItem label="用户名" value={loginInfo?.username} isMono />
                  <InfoItem label="密码" value={loginInfo?.password} isMono />
                  <InfoItem label="登录 URL" value={loginInfo?.loginURL} isMono />
                  <InfoItem label="凭证" value={loginInfo?.credentials} isMono />
                </div>
              </div>
            )}

            {hasDbInfo && (
              <>
                {hasLoginInfo && <Separator className="bg-border/30" />}
                <div>
                  <h4 className="text-xs font-medium text-cyber-purple mb-2">数据库信息</h4>
                  <div className="space-y-1 pl-2 border-l-2 border-cyber-purple/30">
                    <InfoItem label="主机" value={dbInfo?.Host} isMono />
                    <InfoItem label="数据库" value={dbInfo?.Base} isMono />
                    <InfoItem label="用户名" value={dbInfo?.username} isMono />
                    <InfoItem label="密码" value={dbInfo?.password} isMono />
                  </div>
                </div>
              </>
            )}

            {hasRouteInfo && (
              <>
                {(hasLoginInfo || hasDbInfo) && <Separator className="bg-border/30" />}
                <div>
                  <h4 className="text-xs font-medium text-cyber-orange mb-2">路由示例</h4>
                  <div className="space-y-1 pl-2 border-l-2 border-cyber-orange/30">
                    {routeInfo?.slice(0, 5).map((route, index) => (
                      <div key={index} className="font-mono text-xs text-muted-foreground break-all">
                        {route}
                      </div>
                    ))}
                    {routeInfo && routeInfo.length > 5 && (
                      <div className="text-xs text-muted-foreground">
                        ... 还有 {routeInfo.length - 5} 条路由
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {!hasLoginInfo && !hasDbInfo && !hasRouteInfo && !containerId && (
              <div className="text-muted-foreground text-sm text-center py-4">
                暂无环境信息
              </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
