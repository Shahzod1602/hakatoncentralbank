import React, { useEffect, useState } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { budgetsApi, BudgetRequest } from '../api/budgets';
import { Budget, BudgetType } from '../types';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import { useForm } from 'react-hook-form';
import { format, addMonths, subMonths } from 'date-fns';
import clsx from 'clsx';

const EXPENSE_CATEGORIES = ['Food & Dining', 'Transport', 'Shopping', 'Entertainment', 'Healthcare', 'Education', 'Utilities', 'Rent', 'Insurance', 'Travel', 'Other'];
const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investments', 'Business', 'Gift', 'Rental', 'Other'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function BudgetPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [deletingBudget, setDeletingBudget] = useState<Budget | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<BudgetRequest>();
  const watchedType = watch('type');
  const categories = watchedType === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await budgetsApi.getAll(year, month);
      setBudgets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [year, month]);

  const openCreate = () => {
    setEditingBudget(null);
    reset({ year, month, type: 'EXPENSE', category: '', plannedAmount: undefined });
    setIsModalOpen(true);
  };

  const openEdit = (budget: Budget) => {
    setEditingBudget(budget);
    reset({
      year: budget.year,
      month: budget.month,
      type: budget.type,
      category: budget.category,
      plannedAmount: budget.plannedAmount,
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: BudgetRequest) => {
    setIsSubmitting(true);
    try {
      if (editingBudget) {
        const updated = await budgetsApi.update(editingBudget.id, data);
        setBudgets(prev => prev.map(b => b.id === updated.id ? updated : b));
      } else {
        const created = await budgetsApi.create(data);
        setBudgets(prev => [...prev, created]);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingBudget) return;
    setIsSubmitting(true);
    try {
      await budgetsApi.delete(deletingBudget.id);
      setBudgets(prev => prev.filter(b => b.id !== deletingBudget.id));
      setDeletingBudget(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const expenseBudgets = budgets.filter(b => b.type === 'EXPENSE');
  const incomeBudgets = budgets.filter(b => b.type === 'INCOME');

  const totalPlanned = expenseBudgets.reduce((s, b) => s + Number(b.plannedAmount), 0);
  const totalActual = expenseBudgets.reduce((s, b) => s + Number(b.actualAmount), 0);

  if (isLoading) return <LoadingSpinner className="h-64" />;

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Budget</h1>
          <p className="text-gray-500 text-sm mt-1">Plan and track your monthly spending</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 flex-shrink-0">
          <PlusIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Add Budget</span>
        </button>
      </div>

      {/* Month Picker */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => setCurrentDate(subMonths(currentDate, 1))}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="text-lg font-semibold text-gray-900 w-40 text-center">
          {MONTH_NAMES[month - 1]} {year}
        </h2>
        <button
          onClick={() => setCurrentDate(addMonths(currentDate, 1))}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRightIcon className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Summary */}
      {budgets.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 font-medium">Total Planned</p>
            <p className="text-xl font-bold text-blue-700 mt-1">${totalPlanned.toLocaleString('en-US', { minimumFractionDigits: 0 })}</p>
          </div>
          <div className="bg-orange-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 font-medium">Total Spent</p>
            <p className="text-xl font-bold text-orange-700 mt-1">${totalActual.toLocaleString('en-US', { minimumFractionDigits: 0 })}</p>
          </div>
          <div className={clsx('rounded-xl p-4', totalActual > totalPlanned ? 'bg-red-50' : 'bg-emerald-50')}>
            <p className="text-xs text-gray-500 font-medium">Remaining</p>
            <p className={clsx('text-xl font-bold mt-1', totalActual > totalPlanned ? 'text-red-700' : 'text-emerald-700')}>
              ${(totalPlanned - totalActual).toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </p>
          </div>
        </div>
      )}

      {budgets.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-5xl mb-4">📊</p>
          <h3 className="text-lg font-semibold text-gray-700">No budgets set for {MONTH_NAMES[month - 1]}</h3>
          <p className="text-gray-400 text-sm mt-2 mb-6">Set spending limits for each category</p>
          <button onClick={openCreate} className="btn-primary">Add Budget</button>
        </div>
      ) : (
        <>
          {/* Expense Budgets */}
          {expenseBudgets.length > 0 && (
            <div className="card">
              <h3 className="text-base font-semibold text-gray-900 mb-5">Expense Budgets</h3>
              <div className="space-y-5">
                {expenseBudgets.map(budget => {
                  const actual = Number(budget.actualAmount);
                  const planned = Number(budget.plannedAmount);
                  const percent = planned > 0 ? Math.min((actual / planned) * 100, 100) : 0;
                  const isOver = actual > planned;

                  return (
                    <div key={budget.id}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">{budget.category}</span>
                          {isOver && (
                            <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-700 rounded-full font-medium">Over budget</span>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-gray-500">
                            ${actual.toLocaleString('en-US', { minimumFractionDigits: 0 })} / ${planned.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                          </span>
                          <div className="flex gap-1">
                            <button onClick={() => openEdit(budget)} className="p-1 hover:bg-gray-100 rounded transition-colors">
                              <PencilIcon className="w-3.5 h-3.5 text-gray-400" />
                            </button>
                            <button onClick={() => setDeletingBudget(budget)} className="p-1 hover:bg-red-50 rounded transition-colors">
                              <TrashIcon className="w-3.5 h-3.5 text-red-400" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={clsx('h-full rounded-full transition-all duration-500',
                            isOver ? 'bg-red-500' : percent > 80 ? 'bg-orange-500' : 'bg-indigo-500'
                          )}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{percent.toFixed(0)}% used</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Income Budgets */}
          {incomeBudgets.length > 0 && (
            <div className="card">
              <h3 className="text-base font-semibold text-gray-900 mb-5">Income Goals</h3>
              <div className="space-y-5">
                {incomeBudgets.map(budget => {
                  const actual = Number(budget.actualAmount);
                  const planned = Number(budget.plannedAmount);
                  const percent = planned > 0 ? Math.min((actual / planned) * 100, 100) : 0;

                  return (
                    <div key={budget.id}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">{budget.category}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-gray-500">
                            ${actual.toLocaleString('en-US', { minimumFractionDigits: 0 })} / ${planned.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                          </span>
                          <div className="flex gap-1">
                            <button onClick={() => openEdit(budget)} className="p-1 hover:bg-gray-100 rounded transition-colors">
                              <PencilIcon className="w-3.5 h-3.5 text-gray-400" />
                            </button>
                            <button onClick={() => setDeletingBudget(budget)} className="p-1 hover:bg-red-50 rounded transition-colors">
                              <TrashIcon className="w-3.5 h-3.5 text-red-400" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{percent.toFixed(0)}% achieved</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingBudget ? 'Edit Budget' : 'New Budget'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Type</label>
            <select {...register('type', { required: true })} className="input">
              <option value="EXPENSE">Expense Budget</option>
              <option value="INCOME">Income Goal</option>
            </select>
          </div>

          <div>
            <label className="label">Category</label>
            <select {...register('category', { required: 'Category is required' })} className="input">
              <option value="">Select category</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
          </div>

          <div>
            <label className="label">Planned Amount</label>
            <input
              {...register('plannedAmount', { required: true, valueAsNumber: true, min: 0.01 })}
              type="number"
              step="0.01"
              className="input"
              placeholder="0.00"
            />
          </div>

          <input type="hidden" {...register('year', { valueAsNumber: true, value: year })} />
          <input type="hidden" {...register('month', { valueAsNumber: true, value: month })} />

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
              {isSubmitting ? 'Saving...' : editingBudget ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deletingBudget}
        onClose={() => setDeletingBudget(null)}
        onConfirm={handleDelete}
        title="Delete Budget"
        message={`Delete budget for "${deletingBudget?.category}"?`}
        isLoading={isSubmitting}
      />
    </div>
  );
}
