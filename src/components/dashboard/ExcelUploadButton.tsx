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

type UploadStatus = "idle" | "uploading" | "success" | "error";

export function ExcelUploadButton() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [message, setMessage] = useState("");

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.files?.[0] ?? null;
    setFile(next);
    setStatus("idle");
    setMessage("");
  }

  function handleUpload() {
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
    // mock 처리 — 실제 파싱과 검증은 후속 PR에서 구현
    setTimeout(() => {
      setStatus("success");
      setMessage(`${file.name} 업로드 완료 (mock — 실제 파싱은 후속 PR)`);
    }, 1200);
  }

  function handleReset() {
    setFile(null);
    setStatus("idle");
    setMessage("");
  }

  const statusClass =
    status === "error"
      ? "border-destructive/40 bg-destructive/10 text-destructive"
      : status === "success"
        ? "border-primary/40 bg-primary/10 text-primary"
        : "border-border bg-muted/40 text-muted-foreground";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          엑셀 업로드
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>엑셀 데이터 업로드</DialogTitle>
          <DialogDescription>
            과제용 활동 데이터(.xlsx)를 업로드해주세요. 잘못된 형식이나 누락된
            컬럼이 있으면 에러 메시지가 표시됩니다.
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
        </div>

        <DialogFooter className="flex-row gap-2 sm:justify-end">
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
