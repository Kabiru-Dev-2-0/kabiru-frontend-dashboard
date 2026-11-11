"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Code2, House, Layers, Search, Sparkles } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/ui/BreadCrumbs";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import Dialog from "@/components/ui/Dialog";
import DialogConfirmation from "@/components/ui/DialogConfirmation";
import { InputField } from "@/components/ui/InputField";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { RadioButton } from "@/components/ui/RadioButton";
import { SelectField } from "@/components/ui/SelectField";
import { Stepper } from "@/components/ui/Stepper";
import { SwitchButton } from "@/components/ui/SwitchButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import Tooltip from "@/components/ui/ToolTip";

interface SampleGameModule {
  name: string;
  slug: string;
  source: "Template" | "Custom";
  version: string;
  status: "Published" | "Draft";
}

const sampleModules: SampleGameModule[] = [
  {
    name: "Sorting Algoritma Bubble",
    slug: "sorting-algoritma-bubble",
    source: "Template",
    version: "1.0.0",
    status: "Published",
  },
  {
    name: "Kuis Percabangan If-Else",
    slug: "kuis-percabangan-if-else",
    source: "Template",
    version: "1.1.0",
    status: "Published",
  },
  {
    name: "Simulasi Graf Interaktif",
    slug: "simulasi-graf-interaktif",
    source: "Custom",
    version: "0.2.0",
    status: "Draft",
  },
];

const moduleColumns: DataTableColumn<SampleGameModule>[] = [
  {
    key: "name",
    header: "Nama Modul Game",
    rowHeader: true,
    width: "30%",
  },
  {
    key: "slug",
    header: "Slug",
    width: "25%",
  },
  {
    key: "source",
    header: "Jalur Pembuatan",
    render: (row) => (
      <Badge color={row.source === "Custom" ? "accent" : "primary-outline"} size="sm">
        {row.source}
      </Badge>
    ),
  },
  {
    key: "version",
    header: "Versi Terakhir",
  },
  {
    key: "status",
    header: "Status",
    render: (row) => (
      <Badge color={row.status === "Published" ? "success" : "warning-outline"} size="sm">
        {row.status}
      </Badge>
    ),
  },
];

const templateOptions = [
  { label: "Multiple Choice (Pilihan Ganda)", value: "multiple_choice" },
  { label: "Sorting (Urutkan Item)", value: "sorting" },
  { label: "Drag & Drop (Pasangkan Item)", value: "drag_drop" },
  { label: "Code Debugger (Perbaiki Bug)", value: "code_debugger" },
];

export default function DesignSystemShowcasePage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("sorting");
  const [step, setStep] = useState(1);

  return (
    <div className="flex min-h-screen flex-col gap-8 bg-[#F0F1F3] p-12 font-sans">
      {/* Header Banner */}
      <Card padding={28} className="flex flex-wrap items-center justify-between gap-6 border border-[#BABEC6] bg-white">
        <div className="flex flex-col gap-2">
          <Breadcrumbs
            withBackground
            highlightCurrentBackground
            showIcons
            items={[
              { label: "Kabiru LMS", href: "/", icon: House },
              { label: "Design System & UI Primitives", icon: Layers },
            ]}
          />
          <h1 className="m-0 text-display-3 font-bold text-[#3A3F48]">Kabiru FE Dashboard — Design System</h1>
          <p className="m-0 text-sm text-[#606876]">
            Seluruh token warna, tipografi (Sora &amp; Geist Mono), komponen UI Kabiru, dan integrasi shadcn/ui siap digunakan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Link href="/login">
            <Button variant="primary-outline">Halaman Login</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="primary" rightIcon={<ArrowRight size={16} />}>
              Masuk ke Dashboard Studio
            </Button>
          </Link>
        </div>
      </Card>

      {/* Button & Badge Showcase */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="flex flex-col gap-4">
          <h2 className="m-0 text-heading font-semibold text-[#3A3F48]">1. Tombol Taktil 3D (Button)</h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary" rightIcon={<ArrowRight size={15} />}>
              Primary
            </Button>
            <Button variant="accent" leftIcon={<Sparkles size={15} />}>
              Accent
            </Button>
            <Button variant="success">Success</Button>
            <Button variant="warning">Warning</Button>
            <Button variant="error">Error</Button>
            <Button variant="disabled">Disabled</Button>
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button variant="primary-outline" onClick={() => setIsDialogOpen(true)}>
              Buka Dialog Input
            </Button>
            <Button variant="error-outline" onClick={() => setIsConfirmOpen(true)}>
              Buka Dialog Konfirmasi
            </Button>
          </div>
        </Card>

        <Card className="flex flex-col gap-4">
          <h2 className="m-0 text-heading font-semibold text-[#3A3F48]">2. Badge, Switch, Checkbox, Radio &amp; Tabs (shadcn/ui)</h2>
          <div className="flex flex-wrap items-center gap-2">
            <Badge color="primary">Guru</Badge>
            <Badge color="accent">Developer</Badge>
            <Badge color="success">Published</Badge>
            <Badge color="warning">Draft</Badge>
            <Badge color="error">Error</Badge>
            <Badge color="primary-outline">v1.0.0</Badge>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-2">
            <div className="flex items-center gap-2 text-xs text-[#3A3F48]">
              <SwitchButton size="md" variant="primary" defaultChecked label="Mode Sandbox" />
              <span>Sandbox Aktif</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#3A3F48]">
              <Checkbox size="md" variant="primary" defaultChecked />
              <span>Validasi Manifest</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#3A3F48]">
              <RadioButton name="source" size="md" variant="primary" defaultChecked />
              <span>Jalur Template</span>
            </div>
            <Tooltip content="Preview berjalan di iframe sandbox=allow-scripts">
              <Badge color="primary-outline" size="sm">
                Hover Tooltip Info
              </Badge>
            </Tooltip>
          </div>

          <Tabs defaultValue="html" className="pt-2">
            <TabsList>
              <TabsTrigger value="html">
                <Code2 size={14} />
                index.html
              </TabsTrigger>
              <TabsTrigger value="css">style.css</TabsTrigger>
              <TabsTrigger value="js">script.js</TabsTrigger>
            </TabsList>
            <TabsContent value="html" className="rounded-lg border border-[#BABEC6] bg-[#F0F1F3]/60 p-3 font-mono text-xs text-[#3A3F48]">
              &lt;div id=&quot;game-root&quot;&gt;Siap dimainkan dengan Kabiru SDK&lt;/div&gt;
            </TabsContent>
            <TabsContent value="css" className="rounded-lg border border-[#BABEC6] bg-[#F0F1F3]/60 p-3 font-mono text-xs text-[#3A3F48]">
              #game-root &#123; display: grid; gap: 12px; &#125;
            </TabsContent>
            <TabsContent value="js" className="rounded-lg border border-[#BABEC6] bg-[#F0F1F3]/60 p-3 font-mono text-xs text-[#3A3F48]">
              Kabiru.onInit((&#123; config &#125;) =&gt; console.log(config));
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      {/* Form Controls & Alerts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="flex flex-col gap-4">
          <h2 className="m-0 text-heading font-semibold text-[#3A3F48]">3. InputField &amp; SelectField</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InputField label="Cari Modul Game" placeholder="Ketik nama atau slug..." icon={<Search size={16} />} iconPosition="left" fullWidth />
            <SelectField
              label="Pilih Template Game"
              requiredMark
              options={templateOptions}
              value={selectedTemplate}
              onChange={setSelectedTemplate}
              fullWidth
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <ProgressBar size="lg" variant="primary" value={75} width="45%" detail="Kuota ukuran bundel versi (375 KB / 500 KB)" />
            <div className="w-full sm:w-[45%]">
              <Stepper totalSteps={4} value={step} onChange={setStep} />
            </div>
          </div>
        </Card>

        <Card className="flex flex-col gap-3">
          <h2 className="m-0 text-heading font-semibold text-[#3A3F48]">4. Komponen Alert</h2>
          <Alert variant="help" title="Isolasi Sandbox Aktif" description="Iframe menggunakan sandbox='allow-scripts' tanpa allow-same-origin." />
          <Alert variant="success" title="Manifest Valid" description="Skema manifest v1 lulus validasi Zod dan siap dipublikasikan." />
        </Card>
      </div>

      {/* DataTable Showcase */}
      <Card className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="m-0 text-heading font-semibold text-[#3A3F48]">5. Tabel Data (DataTable)</h2>
          <Badge color="primary-outline">{sampleModules.length} Modul Terdaftar</Badge>
        </div>
        <DataTable columns={moduleColumns} data={sampleModules} />
      </Card>

      {/* Dialogs */}
      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={() => setIsDialogOpen(false)}
        title="Buat Modul Game Baru"
        description="Masukkan nama modul game. Slug akan dibuat otomatis."
        showInput
        inputLabel="Nama Modul"
        inputPlaceholder="Contoh: Sorting Angka Bubble"
      />

      <DialogConfirmation
        open={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => setIsConfirmOpen(false)}
        variant="danger"
        title="Arsipkan Modul?"
        description="Modul yang diarsipkan tidak dapat dipilih pada tantangan baru."
        confirmText="Arsipkan"
      />
    </div>
  );
}
