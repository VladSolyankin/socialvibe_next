import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useUserContext } from "@/context/AuthContext";
import { useLoading } from "@/hooks/useLoading";
import { changeUserOnline, getAllUsers } from "@/lib/firebase";
import { auth } from "@/lib/firebase/config";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { Key, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { toast } from "../ui/use-toast";

const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Это поле обязательно" })
    .email({ message: "Неверный формат email" }),
  password: z
    .string()
    .min(6, { message: "Пароль должен быть не менее 6 символов" })
    .max(20, { message: "Пароль не должен быть больше 20 символов" }),
});

export const SignInForm = () => {
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const { isLoading, onSubmit } = useLoading();
  const { isAuthenticated } = useUserContext();
  const router = useRouter();
  const pageNavigator = (path: string) => {
    router.push(path);
  };

  if (isAuthenticated) {
    pageNavigator("/");
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onUserSignIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
      .then((userCredentials) => {
        localStorage.setItem("userAuth", userCredentials.user.uid);
        localStorage.setItem("isLogged", "true");
        pageNavigator("/news");
        changeUserOnline(true);
        toast({
          title: "✅ Вход выполнен",
          description: "Добро пожаловать!",
        });
        console.log(`${userCredentials.user.uid} user logged`);
      })
      .catch((err) => {
        toast({
          title: "❌ Вход не удался",
          description: "Проверьте корректность введённых данных",
        });
        console.log("Ошибка входа: ", err.message);
      });
  };

  const onFormSubmit = (values: z.infer<typeof formSchema>) => {
    onUserSignIn(values.email, values.password);
  };

  const onPasswordReset = () => {
    setResetDialogOpen(true);
  };

  const onSendResetEmail = async () => {
    auth.languageCode = "ru";
    const userEmails = (await getAllUsers()).map((user) => user.email);
    if (userEmails.includes(resetEmail)) {
      await sendPasswordResetEmail(auth, resetEmail).then(() => {
        toast({
          title: "✅ Письмо отправлено",
          description: "Проверьте ваш почтовый ящик",
        });
        setResetDialogOpen(false);
      });
    } else {
      toast({
        title: "❌ Письмо не отправлено",
        description: "Проверьте корректность введённых данных",
      });
    }
  };

  return (
    <div className="flex flex-col gap-3 items-center justify-center text-center w-full basis-1/2">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onFormSubmit)}
          className="w-[50%] flex flex-col justify-center items-center gap-5"
        >
          <h1 className="text-3xl font-semibold">Вход в аккаунт</h1>
          <p className="text-lg text-gray-400">
            Введите логин и пароль для входа
          </p>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="flex flex-col items-center my-3">
                <Label>Логин (email)</Label>
                <FormControl>
                  <Input placeholder="Логин тут..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          ></FormField>
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="flex flex-col items-center my-3">
                <Label>Пароль</Label>
                <FormControl>
                  <Input placeholder="Пароль тут..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          ></FormField>
          <Button type="submit">Войти</Button>
          <div className="flex items-center justify-center gap-3">
            <Separator className="w-24" />
            <Label className="text-md">Забыли пароль?</Label>
            <Separator className="w-24" />
          </div>
          <Button
            variant="outline"
            type="button"
            disabled={isLoading}
            onClick={onPasswordReset}
          >
            <Mail className="mr-2 h-4 w-4" /> Сброс пароля
          </Button>
        </form>
      </Form>
      <Button
        variant="link"
        className="text-lg"
        onClick={() => pageNavigator("/register")}
      >
        Ещё нет аккаунта?
      </Button>
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent className="flex flex-col gap-5 p-3">
          <DialogHeader className="gap-3">
            <div className="flex items-center gap-1">
              <Key className="mr-2 h-4 w-4" />
              <span>Сбросить пароль от аккаунта</span>
            </div>
          </DialogHeader>
          <div className="flex flex-col gap-3 items-center">
            <Input
              placeholder="Введите ваш логин (email)..."
              onChange={(e) => {
                setResetEmail(e.target.value);
              }}
            />
            <div>
              <Button onClick={onSendResetEmail}>Отправить письмо</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
