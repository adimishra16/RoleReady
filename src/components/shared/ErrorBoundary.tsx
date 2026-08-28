"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children?: ReactNode;
  fallbackTitle?: string;
  fallbackDescription?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 text-center text-sm">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-3">
            <AlertCircle className="h-5 w-5" />
          </div>
          <h4 className="font-semibold text-destructive mb-1">
            {this.props.fallbackTitle || "Something went wrong in this section"}
          </h4>
          <p className="text-muted-foreground text-xs max-w-sm mx-auto mb-4">
            {this.props.fallbackDescription ||
              this.state.error?.message ||
              "An unexpected error occurred. You can retry or continue editing other sections."}
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={this.handleReset}
            className="gap-1.5 text-xs"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Retry Section
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
