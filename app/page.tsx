"use client";

import {
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import {
  ArrowRight,
  Barcode,
  BookOpenCheck,
  Check,
  Clock3,
  CreditCard,
  Download,
  GraduationCap,
  LockKeyhole,
  QrCode,
  ShieldCheck,
  Sparkles,
  Copy,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import QRCode from "qrcode"; 

type PaymentMethod = "pix" | "credit" | "boleto";
type AddressData = {
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}
type ViaCepResponse = {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
};

const benefits = [
  "Cronograma diário para os 70 dias",
  "Conteúdos prioritários de cada área",
  "Roteiro de revisão e simulados",
  "Material digital para consultar no celular",
  "Apostila fisica com exercícios e resumos",
];

const buttonLabel: Record<PaymentMethod, string> = {
  pix: "Continuar com PIX",
  credit: "Pagar com cartão",
  boleto: "Gerar boleto",
};

function isValidCpf(value: string){
  const onlyNumbers = value.replace(/\D/g, "");

  if(onlyNumbers.length !== 11){
    return false;
  }

  const repeatedNumbers = new Set(onlyNumbers);

  if(repeatedNumbers.size === 1){
    return false;
  }
  let sum = 0;

  for(let i = 0; i < 9; i++){
    sum += Number(onlyNumbers[i]) * (10 - i);
  }

  let firstCheckDigit = (sum * 10) % 11;

  if(firstCheckDigit === 10){
    firstCheckDigit = 0;
  } 
  if (firstCheckDigit !== Number(onlyNumbers[9])){
    return false;
  }

  sum = 0;
  for(let i = 0; i < 10; i++){
    sum += Number(onlyNumbers[i]) * (11 - i);
  }
  let secondDigit = (sum * 10) % 11;

  if(secondDigit === 10){
    secondDigit = 0;
  }
  if(secondDigit!== Number(onlyNumbers[10])){
    return false;
  }
  return true;
}

function maskCpf(value: string){
  const onlyNumbers = value.replace(/\D/g, "").slice(0, 11);

    if(onlyNumbers.length <= 3){
      return onlyNumbers;
    }
    if(onlyNumbers.length <= 6){
      return `${onlyNumbers.slice(0, 3)}.${onlyNumbers.slice(3)}`;
    }
    if(onlyNumbers.length <= 9){
      return `${onlyNumbers.slice(0, 3)}.${onlyNumbers.slice(3, 6)}.${onlyNumbers.slice(6)}`;
    }
    return `${onlyNumbers.slice(0, 3)}.${onlyNumbers.slice(3, 6)}.${onlyNumbers.slice(6, 9)}-${onlyNumbers.slice(9)}`;
}

function isValidEmail(value: string){
  const email = value.trim();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);

}

function isValidPhone(value: string){
  const onlyNumbers = value.replace(/\D/g, "");

  return onlyNumbers.length === 11 && onlyNumbers[2] === "9";
}
function maskPhone(value: string){
  const onlyNumbers = value.replace(/\D/g, "").slice(0, 11);
  
  if(onlyNumbers.length === 0 ){
    return "";
  }
  if(onlyNumbers.length <= 2){
    return `(${onlyNumbers}`;
  }
  if(onlyNumbers.length <= 7){
    return  `(${onlyNumbers.slice(0, 2)}) ${onlyNumbers.slice(2)}`;
  }
  return `(${onlyNumbers.slice(0, 2)}) ${onlyNumbers.slice(2, 7)}-${onlyNumbers.slice(7)}`;
}
function maskCardName(value: string){
  return maskName(value).toUpperCase();
}

function isvalidName(value: string){
  const words = value.trim().split(/\s+/);

  return words.length >= 2;
}
function maskName(value: string){
  return value
  .replace(/[^\p{L}\s's-]/gu, "")
  .slice(0, 80);
}

function maskCep(value: string){
  const onlyNumbers = value.replace(/\D/g, "").slice(0, 8);

  if(onlyNumbers.length <= 5){
    return onlyNumbers;
  }
  return `${onlyNumbers.slice(0, 5)}-${onlyNumbers.slice(5)}`;
}
function isRequired(value: string) {
  return value.trim().length > 0;
}

function maskState(value: string) {
  return value
    .replace(/[^a-zA-Z]/g, "")
    .slice(0, 2)
    .toUpperCase();
}

function isValidState(value: string) {
  return /^[A-Z]{2}$/.test(value.trim().toUpperCase());
}

function maskCardNumber(value: string){
  const onlyNumber = value.replace(/\D/g, "").slice(0, 16);
 

  if(onlyNumber.length <= 4){
    return onlyNumber;
  }
  if(onlyNumber.length <= 8){
    return `${onlyNumber.slice(0, 4)} ${onlyNumber.slice(4)}`;
  }
  if(onlyNumber.length <= 12){
    return `${onlyNumber.slice(0, 4)} ${onlyNumber.slice(4, 8)} ${onlyNumber.slice(8)}`;
  }
  return `${onlyNumber.slice(0, 4)} ${onlyNumber.slice(4, 8)} ${onlyNumber.slice(8, 12)} ${onlyNumber.slice(12)}`;
  
}
function isValidCardNumber(value: string){
  const onlyNumbers = value.replace(/\D/g, "");

  if(onlyNumbers.length !== 16){
    return false;
  }
  const digits = onlyNumbers.split("").map(Number);
  let sum = 0;
  let shouldDouble = false;
  
  for(let i = digits.length - 1; i >= 0; i--){
    let digit = digits[i];
    
    digit = shouldDouble ? digit * 2 : digit;
    if(digit > 9){
      digit = digit - 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

function isValidExpiry(value: string){
  const onlyNumbers = value.replace(/\D/g, "")

  if(onlyNumbers.length !== 4){
    return false;
  }
const today = new Date();
const currentMonth = today.getMonth() + 1;
const currentYear = today.getFullYear();
const month = Number(onlyNumbers.slice(0, 2));
const year = Number(`20${onlyNumbers.slice(2, 4)}`);

   if(month < 1 || month > 12){
    return false;
 }
  if ( year < currentYear ||(year === currentYear && month < currentMonth)) {
  return false;
  }
return true;
}

function maskExpiry(value: string){
  const onlyNumbers = value.replace(/\D/g, "").slice(0, 4)
  const month = Number(onlyNumbers.slice(0, 2));
  const year = Number(`20${onlyNumbers.slice(2, 4)}`);
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();
  

  if(onlyNumbers.length === 4 && (year < currentYear || (year === currentYear && month < currentMonth)))
    {
    return `${onlyNumbers.slice(0, 2)}/${onlyNumbers.slice(2, 3)}`;
  }
  if(onlyNumbers.length >= 2 && (month < 1 || month > 12)){
    return onlyNumbers.slice(0, 1);
  }
  if(onlyNumbers.length <= 2){
    return onlyNumbers;
  }
  return `${onlyNumbers.slice(0, 2)}/${onlyNumbers.slice(2)}`;
}

function isValidCvv(value: string){
  const onlyNumbers = value.replace(/\D/g, "");

  return onlyNumbers.length === 3 || onlyNumbers.length === 4;
}
function maskCvv(value: string){
  const onlyNumbers = value.replace(/\D/g, "").slice(0, 4);

  return onlyNumbers; 
}
function Field({
  id,
  label,
  placeholder,
  type = "text",
  autoComplete,
  mask,
  validate,
  errorMessage = "Campo inválido", 
  externalValue,
onValueChange,
readOnly = false,
}
: {
  id: string;
  label: string;
  placeholder: string;
  type?: string;
  autoComplete?: string;
  mask?: (value: string) => string;
  validate?: (value: string) => boolean;
  errorMessage?: string;
  externalValue?: string;
  onValueChange?: (value: string) => void;
  readOnly?: boolean;

}) {

const [value, setValue] = useState("");
const [touched, setTouched] = useState(false);

const displayValue = externalValue ?? value;
const hasError =
  touched && validate ? !validate(displayValue) : false;

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-[#dedbea]" htmlFor={id}>
        {label}
      </label>
      <Input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="h-12 rounded-xl border-[#373442] bg-[#0d0d14] px-4 text-base text-white shadow-none placeholder:text-[#6f6b7d] focus-visible:border-[#9b72ff] focus-visible:ring-[#8b5cf6]/20 dark:bg-[#0d0d14]"
        value={displayValue}
        readOnly={readOnly}
        onChange={(event) =>{

            const typedValue = event.target.value;
            const newValue = mask ? mask(typedValue) : typedValue;
          

            setValue(newValue);
            onValueChange?.(newValue);
        }}
        onBlur={() => setTouched(true)}
        aria-invalid={hasError}

      />
      {hasError && (
        <p className="text-sm text-red-400" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
}

function PaymentOption({
  id,
  value,
  selected,
  title,
  subtitle,
  icon,
}: {
  id: string;
  value: PaymentMethod;
  selected: boolean;
  title: string;
  subtitle: string;
  icon: ReactNode;
}) {
  return (
    <div className="relative">
      <RadioGroupItem id={id} value={value} className="peer sr-only" />
      <label
        htmlFor={id}
        className={`flex min-h-[112px] cursor-pointer flex-col items-start justify-between rounded-2xl border p-4 transition-all ${
          selected
            ? "checkout-option-active border-[#9867ff] bg-[#20162f] shadow-[0_0_0_1px_rgba(152,103,255,0.45),0_12px_30px_rgba(96,45,170,0.16)]"
            : "border-[#302e3a] bg-[#101018] hover:border-[#4c465c] hover:bg-[#14131d]"
        }`}
      >
        <div className="flex w-full items-start justify-between">
          <span className={selected ? "text-[#b794ff]" : "text-[#aaa5b8]"}>{icon}</span>
          <span
            className={`flex size-5 items-center justify-center rounded-full border ${
              selected ? "border-[#9b72ff] bg-[#8b5cf6]" : "border-[#514d5e]"
            }`}
          >
            {selected && <Check className="size-3 text-white" strokeWidth={3} />}
          </span>
        </div>
        <div>
          <p className="text-sm font-extrabold text-white">{title}</p>
          <p className="mt-1 text-xs text-[#8f8a9d]">{subtitle}</p>
        </div>
      </label>
    </div>
  );
}

export default function Home() {
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("pix");

  const [addOn, setAddOn] = useState(false);

  const [address, setAddress] = useState<AddressData>({
    cep: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
  });

  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [pixQrCodeBase64, setPixQrCodeBase64] = useState("");
  const [pixCopied, setPixCopied] = useState(false);
  const [showPixPayment, setShowPixPayment] = useState(false);

  const total = addOn ? "29,80" : "19,90";

  const pixPayload = `PIX-DEMONSTRACAO|PLANO-ENEM-70-DIAS|VALOR=${total}`;

useEffect(() => {
  if (!showPixPayment || paymentMethod !== "pix") {
    setPixQrCodeBase64("");
    return;
  }

  async function generatePixQrCode() {
    try {
      const base64 = await QRCode.toDataURL(pixPayload, {
        width: 260,
        margin: 2,
        color: {
          dark: "#09090f",
          light: "#ffffff",
        },
      });

      setPixQrCodeBase64(base64);
    } catch {
      setPixQrCodeBase64("");
    }
  }

  generatePixQrCode();
}, [showPixPayment, paymentMethod, pixPayload]);

  async function searchCep(value: string) {
    const cep = value.replace(/\D/g, "");

    if (cep.length !== 8) {
      return;
    }

    setCepLoading(true);
    setCepError("");

    setAddress((previousAddress) => ({
      ...previousAddress,
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
    }));

    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${cep}/json/`
      );

      if (!response.ok) {
        throw new Error("Erro na consulta do CEP");
      }

      const data: ViaCepResponse = await response.json();

      if (data.erro) {
        setCepError("CEP não encontrado");
        return;
      }

      setAddress((previousAddress) => ({
        ...previousAddress,
        cep: maskCep(data.cep),
        street: data.logradouro,
        neighborhood: data.bairro,
        city: data.localidade,
        state: data.uf,
      }));
    } catch {
      setCepError("Não foi possível consultar o CEP");
    } finally {
      setCepLoading(false);
    }
  }

function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();

  const formData = new FormData(event.currentTarget);

  const getValue = (fieldName: string) =>
    String(formData.get(fieldName) ?? "");

  const personalDataValid =
    isvalidName(getValue("name")) &&
    isValidEmail(getValue("email")) &&
    isValidCpf(getValue("cpf")) &&
    isValidPhone(getValue("phone"));

  const addressDataValid =
    getValue("cep").replace(/\D/g, "").length === 8 &&
    isRequired(getValue("street")) &&
    isRequired(getValue("address-number")) &&
    isRequired(getValue("neighborhood")) &&
    isRequired(getValue("city")) &&
    isValidState(getValue("state")) &&
    cepError === "" &&
    !cepLoading;

  const cardDataValid =
    paymentMethod !== "credit" ||
    (
      isValidCardNumber(getValue("card-number")) &&
      isvalidName(getValue("card-name")) &&
      isValidExpiry(getValue("card-expiry")) &&
      isValidCvv(getValue("card-cvv"))
    );
    
  if (
    !personalDataValid ||
    !addressDataValid ||
    !cardDataValid
  ) {
    setSubmitError("Revise os campos antes de continuar.");
    return;
  }

  setSubmitError("");
  setShowPixPayment(paymentMethod === "pix");
}


async function handleCopyPix() {
  try {
    await navigator.clipboard.writeText(pixPayload);

    setPixCopied(true);

    setTimeout(() => {
      setPixCopied(false);
    }, 2000);
  } catch {
    setPixCopied(false);
  }
}

return (
    <div className="relative min-h-screen overflow-hidden bg-[#09090f] text-white">
      <div
        className="checkout-glow-one pointer-events-none absolute -left-40 top-24 h-[430px] w-[430px] rounded-full bg-[#6d28d9]/15 blur-[110px]"
        aria-hidden="true"
      />
      <div
        className="checkout-glow-two pointer-events-none absolute -right-52 top-[28rem] h-[500px] w-[500px] rounded-full bg-[#c026d3]/10 blur-[130px]"
        aria-hidden="true"
      />

      <header className="checkout-header-enter relative border-b border-white/[0.07] bg-[#09090f]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-[1180px] items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#c026d3] text-white shadow-[0_10px_28px_rgba(124,58,237,0.32)]">
              <GraduationCap className="size-5" strokeWidth={2.3} />
            </span>
            <div>
              <p className="text-[15px] font-extrabold leading-4 tracking-[-0.02em] text-white">Plano ENEM</p>
              <p className="mt-1 text-xs font-medium text-[#8e899b]">70 dias para a prova</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm font-semibold text-[#a7a2b3]">
            <LockKeyhole className="size-4 text-[#b794ff]" />
            <span className="hidden sm:inline">Checkout seguro</span>
            <span className="sm:hidden">Seguro</span>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-[1180px] px-5 py-8 sm:px-8 sm:py-12">
        <div className="checkout-fade-up checkout-delay-1 mb-7 flex items-center gap-3">
          <span className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#c026d3] text-sm font-bold text-white">1</span>
          <div>
            <p className="text-sm font-bold text-white">Identificação e pagamento</p>
            <p className="mt-0.5 text-sm text-[#8e899b]">Preencha seus dados para continuar</p>
          </div>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(340px,0.72fr)] lg:gap-8">
          <section className="checkout-slide-left checkout-delay-2 rounded-[24px] border border-white/[0.08] bg-[#12121b]/95 p-5 shadow-[0_28px_80px_rgba(0,0,0,0.34)] sm:p-8 lg:p-10">
            <div className="mb-8">
              <p className="mb-2 bg-gradient-to-r from-[#a78bfa] to-[#e879f9] bg-clip-text text-xs font-extrabold uppercase tracking-[0.16em] text-transparent">Finalizar pedido</p>
              <h1 className="text-2xl font-extrabold tracking-[-0.035em] text-white sm:text-[2rem] sm:leading-tight">Comece sua reta final hoje</h1>
              <p className="mt-3 max-w-xl text-base leading-7 text-[#a8a3b4]">Informe seus dados e escolha como deseja pagar.</p>
            </div>

            <form
              className="space-y-9"
              aria-label="Dados do pedido"
              onSubmit={handleSubmit}
              onChange={() =>{
                setShowPixPayment(false);
                setPixCopied(false);
              }}
            >
              <fieldset className="checkout-fade-up checkout-delay-3 space-y-5">
                <legend className="mb-5 flex items-center gap-3 text-base font-extrabold text-white">
                  <span className="h-5 w-1 rounded-full bg-[#8b5cf6]" />
                  Seus dados
                </legend>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Field id="name" 
                    label="Nome completo" placeholder="Digite seu nome completo" 
                    autoComplete="name" 
                    mask={maskName} 
                    validate={isvalidName}
                    errorMessage="Digite seu nome completo"
                    /> 
                  </div>
                  <div className="sm:col-span-2">
                    <Field id="email" 
                    label="E-mail" 
                    placeholder="voce@email.com" 
                    type="email" 
                    autoComplete="email" 
                    validate={isValidEmail}
                    errorMessage="E-mail inválido"
                    />
                  </div>
                  <Field id="cpf" label="CPF" 
                  placeholder="000.000.000-00" 
                  autoComplete="off" 
                  mask={maskCpf} 
                  validate={isValidCpf}
                  errorMessage="CPF inválido"
                  /> 
                  <Field id ="phone" 
                  label="Celular" 
                  placeholder="(00) 00000-0000" 
                  type = "tel" 
                  autoComplete="tel" 
                  validate={isValidPhone}
                  errorMessage="Número de celular inválido"
                  mask={maskPhone} 
                  />
                </div>
              </fieldset>

              <fieldset className="checkout-fade-up checkout-delay-4 space-y-5">
                <legend className="mb-5 flex items-center gap-3 text-base font-extrabold text-white">
                  <span className="h-5 w-1 rounded-full bg-[#a855f7]" />
                  Endereço de cobrança
                </legend>

                <div className="grid gap-5 sm:grid-cols-12">
                  <div className="sm:col-span-4">
                    <Field
                      id="cep"
                      label="CEP"
                      placeholder="00000-000"
                      autoComplete="postal-code"
                      mask={maskCep}
                      validate={(value) =>
                        value.replace(/\D/g, "").length === 8
                      }
                      errorMessage="CEP inválido"
                      externalValue={address.cep}
                      onValueChange={(newCep) => {
                        setAddress((previousAddress) => ({
                          ...previousAddress,
                          cep: newCep,
                        }));

                        if (newCep.replace(/\D/g, "").length === 8) {
                          searchCep(newCep);
                        } else {
                          setCepError("");
                        }
                      }}
                    />

                    <div className="mt-2 min-h-5" aria-live="polite">
                      {cepLoading && (
                        <p className="text-sm text-[#b794ff]">
                          Buscando CEP...
                        </p>
                      )}

                      {!cepLoading && cepError && (
                        <p className="text-sm text-red-400" role="alert">
                          {cepError}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="sm:col-span-8">
                    <Field
                      id="street"
                      label="Rua"
                      placeholder="Preenchida automaticamente"
                      autoComplete="address-line1"
                      externalValue={address.street}
                      onValueChange={(newStreet) => {
                        setAddress((previousAddress) => ({
                          ...previousAddress,
                          street: newStreet,
                        }));
                      }}
                      validate={isRequired}
                      errorMessage="Informe a rua"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <Field
                      id="address-number"
                      label="Número"
                      placeholder="Ex.: 123"
                      autoComplete="off"
                      externalValue={address.number}
                      onValueChange={(newNumber) => {
                        setAddress((previousAddress) => ({
                          ...previousAddress,
                          number: newNumber,
                        }));
                      }}
                      validate={isRequired}
                      errorMessage="Informe o número"
                    />
                  </div>

                  <div className="sm:col-span-9">
                    <Field
                      id="address-complement"
                      label="Complemento (opcional)"
                      placeholder="Apartamento, bloco ou referência"
                      autoComplete="address-line2"
                      externalValue={address.complement}
                      onValueChange={(newComplement) => {
                        setAddress((previousAddress) => ({
                          ...previousAddress,
                          complement: newComplement,
                        }));
                      }}
                    />
                  </div>

                  <div className="sm:col-span-5">
                    <Field
                      id="neighborhood"
                      label="Bairro"
                      placeholder="Preenchido automaticamente"
                      autoComplete="address-level3"
                      externalValue={address.neighborhood}
                      onValueChange={(newNeighborhood) => {
                        setAddress((previousAddress) => ({
                          ...previousAddress,
                          neighborhood: newNeighborhood,
                        }));
                      }}
                      validate={isRequired}
                      errorMessage="Informe o bairro"
                    />
                  </div>

                  <div className="sm:col-span-5">
                    <Field
                      id="city"
                      label="Cidade"
                      placeholder="Preenchida automaticamente"
                      autoComplete="address-level2"
                      externalValue={address.city}
                      onValueChange={(newCity) => {
                        setAddress((previousAddress) => ({
                          ...previousAddress,
                          city: newCity,
                        }));
                      }}
                      validate={isRequired}
                      errorMessage="Informe a cidade"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Field
                      id="state"
                      label="UF"
                      placeholder="DF"
                      autoComplete="address-level1"
                      externalValue={address.state}
                      onValueChange={(newState) => {
                        setAddress((previousAddress) => ({
                          ...previousAddress,
                          state: newState,
                        }));
                      }}
                      mask={maskState}
                      validate={isValidState}
                      errorMessage="UF inválida"
                    />
                  </div>
                </div>
              </fieldset>

              <fieldset className="checkout-fade-up checkout-delay-4">
                <legend className="mb-5 flex items-center gap-3 text-base font-extrabold text-white">
                  <span className="h-5 w-1 rounded-full bg-[#c026d3]" />
                  Forma de pagamento
                </legend>

                <RadioGroup
                value={paymentMethod}
                onValueChange={(value) => {
                setPaymentMethod(value as PaymentMethod);
                  setShowPixPayment(false);
                       setPixCopied(false);
                    }}
                 className="grid gap-3 sm:grid-cols-3"
                 aria-label="Escolha a forma de pagamento"
                >
                  <PaymentOption id="payment-pix" value="pix" selected={paymentMethod === "pix"} title="PIX" subtitle="Pagamento à vista" icon={<QrCode className="size-6" />} />
                  <PaymentOption id="payment-credit" value="credit" selected={paymentMethod === "credit"} title="Cartão" subtitle="Crédito" icon={<CreditCard className="size-6" />} />
                  <PaymentOption id="payment-boleto" value="boleto" selected={paymentMethod === "boleto"} title="Boleto" subtitle="Pagamento único" icon={<Barcode className="size-6" />} />
                </RadioGroup>

                <div key={paymentMethod} className="checkout-panel-reveal mt-4 rounded-2xl border border-[#2f2c3a] bg-[#0d0d14] p-4 sm:p-5">
                        
                 {paymentMethod === "pix" && showPixPayment && (
                <div className="grid gap-5 sm:grid-cols-[auto_1fr] sm:items-center">
                 <div className="flex size-[180px] items-center justify-center rounded-2xl bg-white p-3">
                  {paymentMethod === "pix" && !showPixPayment && (
                <div className="flex items-start gap-3">
              <QrCode className="mt-0.5 size-5 shrink-0 text-[#b794ff]" />
             <div>
      <p className="text-sm font-bold text-white">
        Pagamento por PIX
      </p>

      <p className="mt-1 text-sm leading-6 text-[#9994a7]">
        Preencha todos os campos e clique em “Continuar com PIX”
        para gerar o QR Code.
      </p>
    </div>
  </div>
)}
              {pixQrCodeBase64 ? (
            <img
            src={pixQrCodeBase64}
            alt="QR Code para pagamento via PIX"
            className="size-full rounded-lg"
             />
            ) : (
        <p className="text-center text-sm text-black">
          Gerando QR Code...
        </p>
      )}
       </div>

       <div>
      <div className="flex items-center gap-2">
        <QrCode className="size-5 text-[#b794ff]" />

        <p className="text-sm font-bold text-white">
          Pagamento por PIX
        </p>
      </div>

      <p className="mt-2 text-sm leading-6 text-[#9994a7]">
        Escaneie o QR Code utilizando o aplicativo do seu banco.
      </p>

      <p className="mt-3 text-xs text-[#777281]">
        Valor: R$ {total}
      </p>
      <Button
  type="button"
  onClick={handleCopyPix}
  className="mt-4 w-full rounded-xl bg-[#8b5cf6] text-white hover:bg-[#7c3aed]"
>
  {pixCopied ? (
    <Check className="size-4" />
  ) : (
    <Copy className="size-4" />
  )}

  {pixCopied ? "Código copiado!" : "Copiar código PIX"}
</Button>
    </div>
  </div>
)}
                  {paymentMethod === "credit" && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <Field id="card-number" 
                        label="Número do cartão" 
                        placeholder="0000 0000 0000 0000" 
                        autoComplete="cc-number" mask={maskCardNumber} 
                        validate={isValidCardNumber} 
                        errorMessage="Número do cartão inválido" />
                      </div>
                      <div className="sm:col-span-2">
                        <Field id="card-name" 
                        label="Nome impresso no cartão" 
                        placeholder="NOME COMPLETO" 
                        autoComplete="cc-name" 
                        mask={maskCardName} 
                        validate={isvalidName}
                        errorMessage="Digite o nome completo como impresso no cartão"
                        />
                      </div>
                      <Field id="card-expiry" 
                      label="Validade" 
                      placeholder="MM/AA" 
                      autoComplete="cc-exp" 
                      mask={maskExpiry} 
                      validate={isValidExpiry}
                      errorMessage="Validade inválida ou cartão vencido"
                      />
                      <Field id="card-cvv" 
                      label="CVV" 
                      placeholder="000" 
                      autoComplete="cc-csc" 
                      mask={maskCvv} 
                      validate={isValidCvv}
                      errorMessage="CVV inválido"

                      />
                    </div>
                  )}

                  {paymentMethod === "boleto" && (
                    <div className="flex items-start gap-3">
                      <Barcode className="mt-0.5 size-5 shrink-0 text-[#b794ff]" />
                      <div>
                        <p className="text-sm font-bold text-white">Pagamento por boleto</p>
                        <p className="mt-1 text-sm leading-6 text-[#9994a7]">O boleto será gerado usando os dados informados acima.</p>
                      </div>
                    </div>
                  )}
                </div>
              </fieldset>

              <div
                className={`checkout-fade-up checkout-delay-5 relative overflow-hidden rounded-2xl border p-5 transition-all ${
                  addOn
                    ? "checkout-addon-active border-[#a855f7] bg-[#1f142d] shadow-[0_16px_38px_rgba(126,34,206,0.16)]"
                    : "border-[#453653] bg-[#15111d]"
                }`}
              >
                <div className="checkout-badge-pulse absolute right-0 top-0 rounded-bl-xl bg-gradient-to-r from-[#7c3aed] to-[#c026d3] px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.1em] text-white">Oferta especial</div>
                <div className="flex items-start gap-4 pr-1 pt-4 sm:pt-1">
                  <Checkbox
                    id="add-redacao"
                    checked={addOn}
                    onCheckedChange={(checked) => setAddOn(checked === true)}
                    className="mt-1 size-5 rounded-md border-[#71677e] data-[state=checked]:border-[#a855f7] data-[state=checked]:bg-[#8b5cf6]"
                  />
                  <label htmlFor="add-redacao" className="min-w-0 flex-1 cursor-pointer">
                    <div className="flex items-start gap-3">
                      <span className="hidden size-10 shrink-0 items-center justify-center rounded-xl bg-[#8b5cf6]/15 text-[#c4a7ff] sm:flex">
                        <Sparkles className="size-5" />
                      </span>
                      <div>
                        <p className="font-extrabold text-white">Adicionar Kit Redação ENEM 900+</p>
                        <p className="mt-2 text-sm leading-6 text-[#a9a3b3]">Estrutura de redação, repertórios, temas para treino e checklist de correção.</p>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className="text-sm text-[#777281] line-through">R$ 19,90</span>
                          <span className="rounded-full bg-[#a855f7]/15 px-2.5 py-1 text-sm font-extrabold text-[#d8b4fe]">+ R$ 9,90</span>
                        </div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="checkout-fade-up checkout-delay-6 border-t border-white/[0.08] pt-7">
                <div className="mb-5 flex items-end justify-between gap-4" aria-live="polite">
                  <div>
                    <p className="text-base font-semibold text-[#aaa5b5]">Total a pagar</p>
                    {addOn && <p className="mt-1 text-xs text-[#8f899c]">Plano + Kit Redação</p>}
                  </div>
                  <span key={total} className="checkout-total-pop text-3xl font-black tracking-[-0.05em] text-white">R$ {total}</span>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="checkout-cta relative h-14 w-full overflow-hidden rounded-xl border-0 bg-gradient-to-r from-[#7c3aed] via-[#9333ea] to-[#c026d3] text-base font-extrabold shadow-[0_14px_34px_rgba(124,58,237,0.3)] transition-all hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 active:scale-[0.985]"
                  aria-describedby="prototype-note"
                >
                  {buttonLabel[paymentMethod]}
                  <ArrowRight className="size-5" />
                </Button>
                {submitError && (
                  <p className="mt-3 text-center text-sm text-red-400" role="alert">
                    {submitError}
                  </p>
                )}
                <p id="prototype-note" className="mt-3 text-center text-xs leading-5 text-[#777281]">Protótipo visual: nenhuma cobrança será realizada.</p>
              </div>
            </form>
          </section>

          <aside className="checkout-slide-right checkout-delay-3 overflow-hidden rounded-[24px] border border-white/[0.09] bg-[#12121b] text-white shadow-[0_28px_80px_rgba(0,0,0,0.4)] lg:sticky lg:top-8">
            <div className="relative overflow-hidden border-b border-white/[0.08] p-6 sm:p-8">
              <div className="absolute -right-16 -top-20 h-60 w-60 rounded-full bg-[#7c3aed]/25 blur-3xl" aria-hidden="true" />
              <div className="absolute -bottom-24 left-1/4 h-52 w-52 rounded-full bg-[#c026d3]/15 blur-3xl" aria-hidden="true" />

              <div className="relative">
                <div className="mb-8 flex items-center justify-between gap-3">
                  <span className="rounded-full border border-[#8b5cf6]/30 bg-[#8b5cf6]/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.13em] text-[#c4b5fd]">Plano digital</span>
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-[#8f899c]">
                    <Clock3 className="size-3.5" />
                    Reta final
                  </span>
                </div>

                <div className="flex items-end gap-3">
                  <span className="bg-gradient-to-br from-white via-[#ddd6fe] to-[#c084fc] bg-clip-text text-[5.2rem] font-black leading-[0.8] tracking-[-0.09em] text-transparent">70</span>
                  <div className="pb-1">
                    <p className="text-xl font-black leading-5 text-[#d8b4fe]">DIAS</p>
                    <p className="mt-1 text-xs font-bold tracking-[0.18em] text-[#9d97aa]">ATÉ O ENEM</p>
                  </div>
                </div>

                <h2 className="mt-8 text-2xl font-extrabold tracking-[-0.035em] sm:text-[1.75rem]">Plano ENEM 70 Dias</h2>
                <p className="mt-3 text-base leading-7 text-[#aaa5b5]">Um caminho objetivo para organizar seus estudos e aproveitar melhor o tempo até a prova.</p>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <p className="mb-5 text-sm font-extrabold uppercase tracking-[0.12em] text-[#777281]">O que você recebe</p>
              <ul className="space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3 text-[15px] leading-6 text-[#dedbe6]">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#8b5cf6]/15 text-[#c4a7ff]">
                      <Check className="size-3" strokeWidth={3} />
                    </span>
                    {benefit}
                  </li>
                ))}
              </ul>

              <div className="my-7 h-px bg-white/[0.08]" />

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/[0.035] p-4 ring-1 ring-white/[0.08]">
                  <Download className="mb-3 size-5 text-[#c4a7ff]" />
                  <p className="text-sm font-bold">Acesso digital</p>
                  <p className="mt-1 text-xs leading-5 text-[#777281]">Receba por e-mail</p>
                </div>
                <div className="rounded-2xl bg-white/[0.035] p-4 ring-1 ring-white/[0.08]">
                  <BookOpenCheck className="mb-3 size-5 text-[#e879f9]" />
                  <p className="text-sm font-bold">Conteúdo direto</p>
                  <p className="mt-1 text-xs leading-5 text-[#777281]">Sem enrolação</p>
                </div>
              </div>

              <div className="mt-7 space-y-3 rounded-2xl border border-white/[0.08] bg-[#0d0d14] p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-[#9994a5]">Plano ENEM 70 Dias</span>
                  <span className="font-bold text-white">R$ 19,90</span>
                </div>
                {addOn && (
                  <div className="checkout-panel-reveal flex items-center justify-between gap-3 text-sm">
                    <span className="text-[#c4a7ff]">Kit Redação ENEM 900+</span>
                    <span className="font-bold text-[#d8b4fe]">R$ 9,90</span>
                  </div>
                )}
                <div className="h-px bg-white/[0.08]" />
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.11em] text-[#777281]">Total</p>
                    <p className="mt-1 text-sm text-[#9994a5]">Pagamento único</p>
                  </div>
                  <p key={total} className="checkout-total-pop text-2xl font-black tracking-[-0.04em]">R$ {total}</p>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <footer className="checkout-fade-up checkout-delay-6 mt-8 flex flex-col items-center justify-between gap-3 border-t border-white/[0.08] py-6 text-center text-xs text-[#777281] sm:flex-row sm:text-left">
          <p>© 2026 Plano ENEM 70 Dias</p>
          <p className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-[#b794ff]" />
            Seus dados serão protegidos no pagamento
          </p>
        </footer>
      </main>
    </div>
  );
}
