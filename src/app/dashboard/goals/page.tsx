import { createClient } from "@/lib/supabase/server";
import { isDemo } from "@/lib/demo-mode";
import { demoStore } from "@/lib/demo/store";
import type { SavingsGoal } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { GoalDialog } from "@/components/goals/goal-dialog";
import { ContributionForm } from "@/components/goals/contribution-form";
import { DeleteButton } from "@/components/delete-button";
import { deleteGoal } from "@/app/dashboard/goals/actions";

export default async function GoalsPage() {
  let goalsList: SavingsGoal[];

  if (await isDemo()) {
    goalsList = demoStore.getGoals();
  } else {
    const supabase = await createClient();
    const { data: goals } = await supabase
      .from("savings_goals")
      .select("*")
      .order("created_at", { ascending: true });
    goalsList = (goals ?? []) as SavingsGoal[];
  }

  return (
    <Card className="finance-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-heading text-xl">Metas de ahorro</CardTitle>
        <GoalDialog />
      </CardHeader>
      <CardContent>
        {goalsList.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Todavía no tienes metas de ahorro. Crea una para empezar a
            seguir tu progreso.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {goalsList.map((goal) => {
              const pct = Math.min(
                100,
                Math.round(
                  (Number(goal.current_amount) / Number(goal.target_amount)) *
                    100
                )
              );
              return (
                <div
                  key={goal.id}
                  className="finance-panel flex flex-col gap-3 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{goal.name}</p>
                      {goal.target_date && (
                        <p className="text-xs text-muted-foreground">
                          Meta para {formatDate(goal.target_date)}
                        </p>
                      )}
                    </div>
                    <DeleteButton id={goal.id} action={deleteGoal} />
                  </div>
                  <Progress value={pct} />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {formatCurrency(Number(goal.current_amount))} de{" "}
                      {formatCurrency(Number(goal.target_amount))}
                    </span>
                    <span className="font-medium">{pct}%</span>
                  </div>
                  <ContributionForm goalId={goal.id} />
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
