'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReportPreview } from './ReportPreview';
import { downloadReport, downloadAllReports } from '@/lib/api';
import type { ReportListStruct } from '@/lib/types';
import { toast } from 'sonner';

interface ReportListProps {
  projectName: string;
  reports: ReportListStruct;
  maxHeight?: string;
}

export function ReportList({ projectName, reports, maxHeight = '400px' }: ReportListProps) {
  const reportEntries = Object.entries(reports);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<{ id: string; name: string } | null>(null);

  const handleDownload = async (reportId: string, reportName: string) => {
    try {
      await downloadReport(projectName, reportId, reportName);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '下载报告失败');
    }
  };

  const handleDownloadAll = async () => {
    try {
      await downloadAllReports(projectName);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '下载报告失败');
    }
  };

  const handlePreview = (reportId: string, reportName: string) => {
    setSelectedReport({ id: reportId, name: reportName });
    setPreviewOpen(true);
  };

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
            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
            <path d="M14 2v4a2 2 0 0 0 2 2h4" />
            <path d="M10 9H8" />
            <path d="M16 13H8" />
            <path d="M16 17H8" />
          </svg>
          报告列表
          {reportEntries.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto text-xs text-cyber-cyan hover:text-cyber-cyan/80 hover:bg-cyber-cyan/10 h-6 px-2"
              onClick={handleDownloadAll}
            >
              下载全部
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 overflow-y-auto" style={{ maxHeight }}>
          <div className="p-4 pt-0 space-y-2">
            {reportEntries.length === 0 ? (
              <div className="text-muted-foreground text-sm text-center py-4">
                暂无报告
              </div>
            ) : (
              reportEntries.map(([reportId, reportName]) => (
                <div
                  key={reportId}
                  className="flex items-center justify-between p-2 rounded-md bg-muted/30 hover:bg-muted/50 active:bg-muted/60 transition-colors group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-cyber-purple shrink-0"
                    >
                      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                    </svg>
                    <span className="text-sm truncate">{reportName}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity touch-show-actions">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-cyber-purple hover:text-cyber-purple/80 hover:bg-cyber-purple/10"
                      onClick={() => handlePreview(reportId, reportName)}
                      title="预览"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-cyber-cyan hover:text-cyber-cyan/80 hover:bg-cyber-cyan/10"
                      onClick={() => handleDownload(reportId, reportName)}
                      title="下载"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" x2="12" y1="15" y2="3" />
                      </svg>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
      </CardContent>

      {selectedReport && (
        <ReportPreview
          projectName={projectName}
          reportId={selectedReport.id}
          reportName={selectedReport.name}
          open={previewOpen}
          onOpenChange={setPreviewOpen}
        />
      )}
    </Card>
  );
}
