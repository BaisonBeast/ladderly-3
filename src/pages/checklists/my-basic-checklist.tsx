import { BlitzPage } from "@blitzjs/auth"
import { Routes } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import Link from "next/link"
import React, { Suspense } from "react"

import { LadderlyToast } from "src/core/components/LadderlyToast"
import Layout from "src/core/layouts/Layout"
import { UserChecklistQueryHandler } from "src/user-checklists/components/UserChecklistQueryHandler"
import createUserChecklist from "src/user-checklists/mutations/createUserChecklist"
import getLatestUserChecklistByName from "src/user-checklists/queries/getLatestUserChecklistByName"

const CURRENT_CHECKLIST_NAME = "Programming Job Checklist"

const NewestChecklistQueryHandler: React.FC = () => {
  const [createUserChecklistMutation] = useMutation(createUserChecklist)
  const [userChecklistData, { refetch }] = useQuery(getLatestUserChecklistByName, {
    name: CURRENT_CHECKLIST_NAME,
  })
  const [showToast, setShowToast] = React.useState(!userChecklistData?.isLatestVersion)
  const [toastMessage, setToastMessage] = React.useState("A New Checklist Version is Available.")

  const handleToastConfirmClick = async () => {
    const checklistId = userChecklistData?.latestChecklist?.id
    if (!checklistId) return
    setToastMessage("Update in progress...")

    try {
      await createUserChecklistMutation({ checklistId })
      await refetch()
      setShowToast(false)
    } catch (error) {
      alert("Error updating checklist items.")
    }
  }

  const handleToastCloseClick = () => {
    setShowToast(false)
  }

  return showToast ? (
    <LadderlyToast
      message={toastMessage}
      onClick={handleToastConfirmClick}
      onClose={handleToastCloseClick}
    />
  ) : null
}

const MyBasicChecklist: BlitzPage = () => {
  return (
    <Layout title={CURRENT_CHECKLIST_NAME}>
      <div className="relative min-h-screen">
        <nav className="border-ladderly-light-purple text-ladderly-violet-700et-700 flex border bg-ladderly-off-white px-4 py-1">
          <Link className="ml-auto text-gray-800 hover:text-ladderly-pink" href={Routes.Home()}>
            Back to Home
          </Link>
        </nav>

        <Suspense>
          <NewestChecklistQueryHandler />
        </Suspense>

        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <div className="m-8 w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-xl">
            <h1 className="mb-4 text-2xl font-bold text-gray-800">{CURRENT_CHECKLIST_NAME}</h1>
            <Suspense fallback="Loading...">
              <UserChecklistQueryHandler name={CURRENT_CHECKLIST_NAME} />
            </Suspense>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default MyBasicChecklist
