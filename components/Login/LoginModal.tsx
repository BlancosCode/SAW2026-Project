"use client";

import React, { useState } from "react";
import { signIn } from "@/../lib/auth-client";
import { LogIn } from "lucide-react";
import {
  Modal,
  Form,
  Input,
  Button,
  Label,
  TextField,
  FieldError,
} from "@heroui/react";

//come da libreria HeroUI per i modali, fusi con vari altri componenti per formare il modale di login

type LoginModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      await signIn.email({
        email,
        password,
        fetchOptions: {
          onSuccess: (ctx) => {
            const role = (ctx.data?.user as any)?.role || "freelancer";
            window.location.href = `/dashboard/${role}`;
          },
          onError: (ctx) => {
            setError(ctx.error.message);
            setIsLoading(false);
          },
        },
      });
    } catch (err) {
      console.error("Errore imprevisto durante il login:", err);
      setError("Si è verificato un errore di connessione.");
      setIsLoading(false);
    }
  };

  const labelStyle = "block text-sm font-bold text-gray-700 mb-1";

  return (
    <Modal isOpen={isOpen} onOpenChange={(open) => { if (!open) { setError(null); onClose(); } }}>
      <Modal.Backdrop variant="blur">
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-[400px]">
            <Modal.Header className="flex flex-col gap-1 text-gray-800 border-b border-gray-100 pb-4">
              <Modal.Heading className="text-gray-900 font-bold flex items-center justify-center gap-2 text-2xl w-full">
                Area Personale
                <LogIn className="size-8 text-gray-900" />
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body className="py-6 px-2">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-2 text-sm font-medium text-center">
                  {error}
                </div>
              )}

              <Form onSubmit={handleLogin} className="flex flex-col gap-5 w-full">
                <TextField name="email" type="email" isRequired>
                  <Label className={labelStyle}>Email</Label>
                  <Input placeholder="mariorossi@gmail.com" />
                  <FieldError />
                </TextField>

                <TextField name="password" type="password" isRequired>
                  <Label className={labelStyle}>Password</Label>
                  <Input placeholder="••••••••" />
                  <FieldError />
                </TextField>

                <Button
                  type="submit"
                  isDisabled={isLoading}
                  isPending={isLoading}
                  className="w-full bg-gray-600 hover:bg-gray-800 text-white font-bold py-3 mt-2 shadow-sm transition-colors"
                >
                  Accedi
                </Button>
              </Form>

              <p className="text-center text-gray-500 text-xs mt-6">
                Area riservata. Non hai ricevuto le credenziali? Contattaci se vuoi diventare un nostro partner!
              </p>
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}