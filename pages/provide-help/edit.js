import axios from "axios";
import { useFormik } from "formik";
import { useSession } from "next-auth/client";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import CreatableSelect from "react-select/creatable";
import * as Yup from "yup";
import Layout from "../../components/Layout";
import Record from "../../components/Record";
import RedirectPrompt from "../../components/RedirectPrompt";

export default function editProvideHelp() {
  const [session, loading] = useSession();
  const router = useRouter();
  const [creatableSkills, setCreatableSkills] = useState(null);
  const [helpData, setHelpData] = useState({
    message: "",
    skills: "",
  });
  const [disablePage, setDisablePage] = useState(false);
  const [displayText, setDisplayText] = useState("");
  const [translatedText, setTranslatedText] = useState("");

  useEffect(() => {
    if (!loading && !session) {
      router.push("/login");
    }

    if (!loading && session) {
      let userData = session.dbUser;

      // Fetch data based on provide id of user
      async function fetchData() {
        let { data: fetchedProvideData } = await axios({
          method: "get",
          url: `/api/provide-help?id=${userData.provideHelp}`,
        });

        let initialProfile = {};

        for (var key in helpData) {
          if (helpData.hasOwnProperty(key)) {
            initialProfile[key] = fetchedProvideData[key] || "";
          }
        }

        let skills = [];
        fetchedProvideData.skills.forEach((skill) => {
          skills.push({
            label: skill,
            value: skill,
          });
        });
        setCreatableSkills(skills);

        setHelpData(initialProfile);
      }

      // Redirect if there isn't any provideHelp
      if (userData.provideHelp == null) {
        setDisablePage(true);
      } else {
        fetchData();
      }
    }
  }, [loading, session]);

  const formik = useFormik({
    initialValues: {
      message: helpData.message,
      skills: helpData.skills,
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      message: Yup.string().required("This field is required."),
      skills: Yup.array().min(1, "Please add at least one skill."),
    }),
    onSubmit: async (values, { resetForm }) => {
      let { data } = await axios({
        method: "put",
        url: `/api/provide-help`,
        data: values,
      });

      resetForm();

      router.push("/");
    },
  });

  const deleteProvideHelp = async () => {
    await axios({
      method: "delete",
      url: `/api/provide-help`,
    });

    router.push("/");
  };

  if (disablePage === true) {
    return (
      <Layout pageTitle="Edit Help Provision">
        <RedirectPrompt message="You haven't submitted a help provision." />
      </Layout>
    );
  }

  return (
    <>
      {session && (
        <Layout>
          <form className="space-y-8 divide-y divide-gray-200 mt-10" onSubmit={formik.handleSubmit}>
            <div className="space-y-8 divide-y divide-gray-200 sm:space-y-5">
              <div>
                <div>
                  <h3 className="text-3xl leading-6 font-bold text-gray-900">
                    Update Provide to Find Job!
                  </h3>
                  <p className="mt-4 max-w-2xl text-sm text-gray-500 pb-3">
                    Please be mindful to post appropriate content only. Inappropriate content will
                    be deleted without notice.
                  </p>
                </div>
                <div>
                  <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start border-t sm:border-gray-200 sm:py-8">
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-gray-700 mt-2 sm:mt-px sm:pt-2"
                    >
                      Description of the job you are looking for
                      <Record
                        setTranslatedText={setTranslatedText}
                        setDisplayText={setDisplayText}
                        setHelpData={setHelpData}
                        helpData={helpData}
                      />
                      {displayText != "" ? (
                        <>
                          <label
                            htmlFor="skills"
                            className="block mb-1 text-xs font-medium text-gray-700 sm:mt-px sm:pt-2"
                          >
                            Spoken words in text:
                          </label>
                          <p className="text-sm mb-1">{displayText}</p>
                        </>
                      ) : null}
                      {translatedText != "" ? (
                        <>
                          <label
                            htmlFor="skills"
                            className="block mb-1 text-xs font-medium text-gray-700 sm:mt-px sm:pt-2"
                          >
                            Translated text:
                          </label>
                          <p className="text-sm mb-1">{translatedText}</p>
                        </>
                      ) : null}
                    </label>
                    <div className="mt-1 sm:mt-0 sm:col-span-2">
                      <textarea
                        id="message"
                        name="message"
                        rows={8}
                        className="shadow-sm block w-full  sm:text-sm border border-gray-300 rounded-md"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.message}
                      ></textarea>
                      {formik.touched.message && formik.errors.message ? (
                        <p className="text-sm text-red-400 mt-1">{formik.errors.message}</p>
                      ) : null}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start border-t sm:border-gray-200 sm:pt-8">
                    <label
                      htmlFor="skills"
                      className="block text-sm font-medium text-gray-700 mt-2 sm:mt-px sm:pt-2"
                    >
                      Skills
                    </label>
                    <div className="mt-1 sm:mt-0 sm:col-span-2">
                      <CreatableSelect
                        isMulti
                        className="cursor-pointer"
                        onChange={(e) => {
                          let flatSkillsArray = e.map((skill) => {
                            return skill.value;
                          });
                          formik.setFieldValue("skills", flatSkillsArray);
                          setCreatableSkills(e);
                        }}
                        value={creatableSkills}
                        id="skills"
                        instanceId="skills"
                      />
                      {formik.touched.skills && formik.errors.skills ? (
                        <p className="text-sm text-red-400 mt-1">{formik.errors.skills}</p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-5">
              <div className="flex justify-end">
                <button
                  onClick={deleteProvideHelp}
                  type="button"
                  className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none"
                >
                  Delete
                </button>
                <button
                  type="submit"
                  className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-sky-700 hover:bg-sky-800 focus:outline-none"
                >
                  Update
                </button>
              </div>
            </div>
          </form>
        </Layout>
      )}
    </>
  );
}
