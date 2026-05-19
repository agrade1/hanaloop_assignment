"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { parseActivities } from "@/lib/excel-import";
import type { ActivityRecord } from "@/lib/types";

type UploadStatus = "idle" | "uploading" | "success" | "error";

type Props = {
  /**
   * 파싱·검증 성공 시 부모에게 활동 데이터를 전달.
   * optional — 없으면 모달 안에서 검증만 보여주고 끝.
   */
  onUpload?: (activities: ActivityRecord[]) => void;
  /** 업로드된 데이터에 부여할 productId (엑셀에 없으므로 호출자가 지정) */
  productId?: string;
};

export function ExcelUploadButton({
  onUpload,
  productId = "CT-045",
}: Props = {}) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.files?.[0] ?? null;
    setFile(next);
    setStatus("idle");
    setMessage("");
    setErrors([]);
  }

  async function handleUpload() {
    if (!file) {
      setStatus("error");
      setMessage("파일을 선택해주세요.");
      return;
    }
    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      setStatus("error");
      setMessage("xlsx 확장자만 업로드할 수 있습니다.");
      return;
    }

    setStatus("uploading");
    setMessage("파일 검증 중...");
    setErrors([]);

    try {
      const buffer = await file.arrayBuffer();
      const result = parseActivities(buffer, productId);

      if (!result.ok) {
        setStatus("error");
        setMessage(`검증 실패 — ${result.errors.length}건의 문제 발견`);
        setErrors(result.errors);
        return;
      }

      setStatus("success");
      setMessage(`${result.activities.length}건의 활동을 임포트했습니다.`);
      onUpload?.(result.activities);
    } catch (err) {
      setStatus("error");
      setMessage(
        `파일을 읽는 중 오류가 발생했습니다: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  function handleReset() {
    setFile(null);
    setStatus("idle");
    setMessage("");
    setErrors([]);
  }

  const statusClass =
    status === "error"
      ? "border-destructive/40 bg-destructive/10 text-destructive"
      : status === "success"
        ? "border-primary/40 bg-primary/10 text-primary"
        : "border-border bg-muted/40 text-muted-foreground";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        엑셀 업로드
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>엑셀 데이터 업로드</DialogTitle>
          <DialogDescription>
            과제용 활동 데이터(.xlsx)를 업로드해주세요. 잘못된 형식이나 값이 있으면
            행 번호와 함께 구체적인 에러 메시지가 표시됩니다.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="excel-file">파일 선택</Label>
            <Input
              id="excel-file"
              type="file"
              accept=".xlsx"
              onChange={handleFileChange}
              disabled={status === "uploading"}
            />
            {file && (
              <p className="text-xs text-muted-foreground">
                선택된 파일: {file.name}
              </p>
            )}
          </div>

          {message && (
            <div
              role="status"
              className={`rounded-md border px-3 py-2 text-sm ${statusClass}`}
            >
              {message}
            </div>
          )}

          {errors.length > 0 && (
            <div className="max-h-40 overflow-y-auto rounded-md border border-destructive/30 bg-destructive/5 p-2">
              <ul className="flex flex-col gap-1 text-xs text-destructive">
                {errors.map((err, idx) => (
                  <li key={idx} className="leading-relaxed">
                    · {err}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={status === "uploading"}
          >
            초기화
          </Button>
          <Button
            size="sm"
            onClick={handleUpload}
            disabled={status === "uploading"}
          >
            {status === "uploading" ? "검증 중..." : "업로드"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
