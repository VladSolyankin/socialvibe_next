import { useLoading } from "@/hooks/useLoading";
import { Button } from "../ui/button";
import { Icons } from "../ui/icons";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import { createUserDocument } from "@/lib/firebase";
import { auth } from "@/lib/firebase/config";
import { onUserSignUp } from "@/lib/firebase/auth";
import { useToast } from "../ui/use-toast";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "../ui/dialog";
import { FolderUp } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { cities } from "@/constants";

const formSchema = z
  .object({
    email: z
      .string()
      .min(1, { message: "Это поле обязательно" })
      .email({ message: "Неверный формат email" }),
    password: z
      .string()
      .min(6, { message: "Пароль должен быть не менее 6 символов" })
      .max(20, { message: "Пароль не должен быть больше 20 символов" }),
    password_check: z.string().min(1, { message: "Это поле обязательно" }),
  })
  .refine((data) => data.password === data.password_check, {
    message: "Пароли должны совпадать",
    path: ["password_check"],
  });

export const SignUpForm = () => {
  const { isLoading, onSubmit } = useLoading();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pageNavigator = (path: string) => {
    router.push(path);
  };
  const { toast } = useToast();
  const steps = useState({
    first: false,
    second: false,
    third: false,
    fourth: false,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      password_check: "",
    },
  });

  const onFormSubmit = async (values: z.infer<typeof formSchema>) => {
    await onUserSignUp(values.email, values.password);
    await createUserDocument(auth.currentUser?.uid, values.email, "", "");
    pageNavigator("/login");
    toast({
      title: "✅ Регистрация успешна!",
      description: "Войдите в систему, используя ваши данные",
    });
  };

  useEffect(() => {
    setIsOpen(true);
  }, []);

  const onStepChange = (step: string) => {
    steps[step] = true;
    if (steps[1] && steps[2] && steps[3] && steps[4]) {
      onSubmit();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-[50%] gap-5">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onFormSubmit)}
          className="w-[50%] flex flex-col justify-center items-center gap-5"
        >
          <h1 className="text-3xl font-semibold">Регистрация</h1>
          <p className="text-lg text-gray-400">
            Введите логин и пароль для входа
          </p>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="flex flex-col items-center my-2" {...field}>
                <Label>Логин (email)</Label>
                <FormControl>
                  <Input placeholder="Ваш логин тут..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          ></FormField>
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="flex flex-col items-center my-2" {...field}>
                <Label>Пароль</Label>
                <FormControl>
                  <Input placeholder="Ваш пароль тут..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          ></FormField>
          <FormField
            control={form.control}
            name="password_check"
            render={({ field }) => (
              <FormItem className="flex flex-col items-center my-2" {...field}>
                <Label>Подтверждение</Label>
                <FormControl>
                  <Input placeholder="Подтвердите пароль..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          ></FormField>
          <Button type="submit">Создать аккаунт</Button>
        </form>
      </Form>
      <div className="flex items-center justify-center gap-3">
        <Separator className="w-24" />
        <Label className="text-md">Или, войдите с помощью </Label>
        <Separator className="w-24" />
      </div>
      <Button
        variant="outline"
        type="button"
        disabled={isLoading}
        onClick={onSubmit}
      >
        {isLoading ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.google className="mr-2 h-4 w-4" />
        )}
        Gmail
      </Button>
      <Button
        variant="link"
        className="text-lg"
        onClick={() => pageNavigator("/login")}
      >
        Уже есть аккаунт?
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="p-10 min-w-[50vw]">
          <DialogHeader className="text-lg font-bold mx-auto">
            📋 Немного персональной информации
          </DialogHeader>
          <div className="flex">
            <ol className="relative text-gray-500 border-s border-gray-200 dark:border-gray-700 dark:text-gray-400 border-r-2 w-[30%]">
              <li className="mb-10 ms-6">
                <span className="absolute flex items-center justify-center w-8 h-8 bg-green-200 rounded-full -start-4 ring-4 ring-white dark:ring-gray-900 dark:bg-green-900">
                  {steps.first ? (
                    <svg
                      className="w-3.5 h-3.5 text-green-300 dark:text-green-500"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 16 12"
                    >
                      <path
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M1 5.917 5.724 10.5 15 1.5"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 18 20"
                    >
                      <path d="M16 1h-3.278A1.992 1.992 0 0 0 11 0H7a1.993 1.993 0 0 0-1.722 1H2a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Zm-3 14H5a1 1 0 0 1 0-2h8a1 1 0 0 1 0 2Zm0-4H5a1 1 0 0 1 0-2h8a1 1 0 1 1 0 2Zm0-5H5a1 1 0 0 1 0-2h2V2h4v2h2a1 1 0 1 1 0 2Z" />
                    </svg>
                  )}
                </span>
                <h3 className="font-medium leading-tight">Общая информация</h3>
                <p className="text-sm">ФИО, Город</p>
              </li>
              <li className="mb-10 ms-6">
                <span className="absolute flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full -start-4 ring-4 ring-white dark:ring-gray-900 dark:bg-gray-700">
                  <svg
                    className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 16"
                  >
                    <path d="M18 0H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2ZM6.5 3a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3.014 13.021l.157-.625A3.427 3.427 0 0 1 6.5 9.571a3.426 3.426 0 0 1 3.322 2.805l.159.622-6.967.023ZM16 12h-3a1 1 0 0 1 0-2h3a1 1 0 0 1 0 2Zm0-3h-3a1 1 0 1 1 0-2h3a1 1 0 1 1 0 2Zm0-3h-3a1 1 0 1 1 0-2h3a1 1 0 1 1 0 2Z" />
                  </svg>
                </span>
                <h3 className="font-medium leading-tight">Прочее</h3>
                <p className="text-sm">Телефон, Дата рождения</p>
              </li>
              <li className="mb-10 ms-6">
                <span className="absolute flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full -start-4 ring-4 ring-white dark:ring-gray-900 dark:bg-gray-700">
                  <svg
                    className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 18 20"
                  >
                    <path d="M16 1h-3.278A1.992 1.992 0 0 0 11 0H7a1.993 1.993 0 0 0-1.722 1H2a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Zm-3 14H5a1 1 0 0 1 0-2h8a1 1 0 0 1 0 2Zm0-4H5a1 1 0 0 1 0-2h8a1 1 0 1 1 0 2Zm0-5H5a1 1 0 0 1 0-2h2V2h4v2h2a1 1 0 1 1 0 2Z" />
                  </svg>
                </span>
                <h3 className="font-medium leading-tight">
                  Фото профиля (необязательно)
                </h3>
                <p className="text-sm">Выберите изображение</p>
              </li>
              <li className="ms-6">
                <span className="absolute flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full -start-4 ring-4 ring-white dark:ring-gray-900 dark:bg-gray-700">
                  <svg
                    className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 18 20"
                  >
                    <path d="M16 1h-3.278A1.992 1.992 0 0 0 11 0H7a1.993 1.993 0 0 0-1.722 1H2a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2ZM7 2h4v3H7V2Zm5.7 8.289-3.975 3.857a1 1 0 0 1-1.393 0L5.3 12.182a1.002 1.002 0 1 1 1.4-1.436l1.328 1.289 3.28-3.181a1 1 0 1 1 1.392 1.435Z" />
                  </svg>
                </span>
                <h3 className="font-medium leading-tight">Проверка</h3>
                <p className="text-sm">Подтвердите корректность данных</p>
              </li>
            </ol>
            <div className="flex items-center justify-center w-[70%]">
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue>Выберите город...</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => {
                    return (
                      <SelectValue key={city} value={city}>
                        {city}
                      </SelectValue>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
