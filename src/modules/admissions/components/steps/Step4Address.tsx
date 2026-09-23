import React from 'react';
import { MapPin, Home, Building, CheckSquare, Square, AlertCircle } from 'lucide-react';
import { AdmissionFormData } from '../../../../types';
import { BANGLADESH_DIVISIONS } from '../../../../constants';
import { Input } from '../../../../components/common/Input';
import { Select } from '../../../../components/common/Select';

interface Step4Props {
  formData: AdmissionFormData;
  updateFormData: (fields: Partial<AdmissionFormData>) => void;
  errors: Record<string, string>;
}

export const Step4Address: React.FC<Step4Props> = ({ formData, updateFormData, errors }) => {
  const handleSameAsPresentToggle = (isChecked: boolean) => {
    if (isChecked) {
      updateFormData({
        isPermanentSameAsPresent: true,
        permanentDivision: formData.presentDivision,
        permanentDistrict: formData.presentDistrict,
        permanentThana: formData.presentThana,
        permanentPostCode: formData.presentPostCode,
        permanentAddress: formData.presentAddress,
      });
    } else {
      updateFormData({
        isPermanentSameAsPresent: false,
      });
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Section Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-[var(--color-border-subtle)]">
        <div className="w-9 h-9 rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center font-bold">
          ৪
        </div>
        <div>
          <h3 className="text-base font-bold text-[var(--color-text-main)]">
            ঠিকানা ও অবস্থান সম্পর্কিত তথ্য (Address Information)
          </h3>
          <p className="text-xs text-[var(--color-text-muted)]">
            শিক্ষার্থীর বর্তমান বাসস্থান এবং স্থায়ী ঠিকানার পূর্ণাঙ্গ বিবরণ
          </p>
        </div>
      </div>

      {/* Present Address Card */}
      <div className="p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-muted)] space-y-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[var(--color-primary)]" />
          <h4 className="text-xs font-bold text-[var(--color-text-main)]">
            বর্তমান ঠিকানা (Present Address)
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
              বিভাগ (Division) <span className="text-rose-500">*</span>
            </label>
            <Select
              id="present-division"
              value={formData.presentDivision}
              onChange={(e) => updateFormData({ presentDivision: e.target.value })}
            >
              {BANGLADESH_DIVISIONS.map((div) => (
                <option key={div} value={div}>
                  {div}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
              জেলা (District) <span className="text-rose-500">*</span>
            </label>
            <Input
              id="present-district"
              type="text"
              placeholder="যেমন: ঢাকা"
              value={formData.presentDistrict}
              onChange={(e) => updateFormData({ presentDistrict: e.target.value })}
              className={errors.presentDistrict ? 'border-rose-500 ring-rose-500/20' : ''}
            />
            {errors.presentDistrict && (
              <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.presentDistrict}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
              থানা / উপজেলা (Thana / Upazila) <span className="text-rose-500">*</span>
            </label>
            <Input
              id="present-thana"
              type="text"
              placeholder="যেমন: মিরপুর"
              value={formData.presentThana}
              onChange={(e) => updateFormData({ presentThana: e.target.value })}
              className={errors.presentThana ? 'border-rose-500 ring-rose-500/20' : ''}
            />
            {errors.presentThana && (
              <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.presentThana}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
              পোস্ট কোড (Post Code)
            </label>
            <Input
              id="present-postcode"
              type="text"
              placeholder="যেমন: ১২১৬"
              value={formData.presentPostCode || ''}
              onChange={(e) => updateFormData({ presentPostCode: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
            বিস্তারিত ঠিকানা (গ্রাম / রাস্তা / বাড়ি নং / মহল্লা) <span className="text-rose-500">*</span>
          </label>
          <Input
            id="present-detailed-address"
            type="text"
            placeholder="যেমন: বাড়ি নং ১২, রোড নং ৫, ব্লক-বি, সেকশন-১০"
            value={formData.presentAddress}
            onChange={(e) => updateFormData({ presentAddress: e.target.value })}
            className={errors.presentAddress ? 'border-rose-500 ring-rose-500/20' : ''}
          />
          {errors.presentAddress && (
            <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.presentAddress}
            </p>
          )}
        </div>
      </div>

      {/* Permanent Address Card */}
      <div className="p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface-muted)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Home className="w-5 h-5 text-[var(--color-primary)]" />
            <h4 className="text-xs font-bold text-[var(--color-text-main)]">
              স্থায়ী ঠিকানা (Permanent Address)
            </h4>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              id="same-as-present-checkbox"
              checked={formData.isPermanentSameAsPresent}
              onChange={(e) => handleSameAsPresentToggle(e.target.checked)}
              className="w-4 h-4 rounded text-[var(--color-primary)] focus:ring-[var(--color-primary)]/20"
            />
            <span className="text-xs font-medium text-[var(--color-text-main)]">
              বর্তমান ঠিকানার অনুরূপ (Same as Present)
            </span>
          </label>
        </div>

        {!formData.isPermanentSameAsPresent && (
          <div className="space-y-4 pt-2 border-t border-[var(--color-border-subtle)] animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
                  বিভাগ (Division)
                </label>
                <Select
                  id="perm-division"
                  value={formData.permanentDivision}
                  onChange={(e) => updateFormData({ permanentDivision: e.target.value })}
                >
                  {BANGLADESH_DIVISIONS.map((div) => (
                    <option key={div} value={div}>
                      {div}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
                  জেলা (District)
                </label>
                <Input
                  id="perm-district"
                  type="text"
                  placeholder="যেমন: কুমিল্লা"
                  value={formData.permanentDistrict}
                  onChange={(e) => updateFormData({ permanentDistrict: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
                  থানা / উপজেলা
                </label>
                <Input
                  id="perm-thana"
                  type="text"
                  placeholder="যেমন: লাকসাম"
                  value={formData.permanentThana}
                  onChange={(e) => updateFormData({ permanentThana: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
                  পোস্ট কোড
                </label>
                <Input
                  id="perm-postcode"
                  type="text"
                  placeholder="যেমন: ৩৫০০"
                  value={formData.permanentPostCode || ''}
                  onChange={(e) => updateFormData({ permanentPostCode: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-main)] mb-1">
                স্থায়ী বিস্তারিত ঠিকানা (গ্রাম / ডাকঘর / ইউনিয়ন)
              </label>
              <Input
                id="perm-detailed-address"
                type="text"
                placeholder="যেমন: গ্রাম: দৌলতপুর, ডাকঘর: বিজয়নগর"
                value={formData.permanentAddress}
                onChange={(e) => updateFormData({ permanentAddress: e.target.value })}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
