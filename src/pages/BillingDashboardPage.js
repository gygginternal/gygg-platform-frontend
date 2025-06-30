import React from 'react';
import styles from './BillingDashboardPage.module.css';
import BillingTable from '../components/BillingDashboardPage/BillingTable';
import BillingModal from '../components/BillingDashboardPage/BillingModal';

const BillingDashboardPage = () => {
  return (
    <div className={styles.container}>
      <div className={styles.mainContentWrapper}>
        <div className={styles.headerSection}>
          <div className={styles.searchContainer}>
            <div className={styles.searchInputWrapper}>
              <img
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/b1280a9927158f9169292f3ca7fc5bc5a3832285?placeholderIfAbsent=true"
                className={styles.searchIcon}
                alt="Search icon"
              />
              <div className={styles.searchText}>Search Tasks</div>
            </div>
            <button className={styles.searchButton}>Search</button>
          </div>
        </div>
        <div className={styles.heroSection}>
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/f018df3dfdd4661a9799375840d522c6e89897e9?placeholderIfAbsent=true"
            className={styles.heroLogo}
            alt="Logo"
          />
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/1cbcd8b3320402fe3eaa8f59570aff0a08b2716a?placeholderIfAbsent=true"
            className={styles.heroDecoration}
            alt="Decoration"
          />
        </div>
        <div className={styles.dashboardLayout}>
          <div className={styles.leftColumn}>
            <div className={styles.sidebar}>
              <div className={styles.sidebarItem}>Home</div>
              <div className={styles.sidebarSeparator} />
              <div className={styles.sidebarItem}>Messages</div>
              <div className={styles.sidebarContractSection}>
                <div className={styles.sidebarContractSeparator} />
                <div className={styles.sidebarContractText}>Contracts</div>
              </div>
              <div className={styles.sidebarSeparator} />
              <div className={styles.sidebarItem}>Gigs</div>
              <div className={styles.sidebarSeparatorAlt} />
            </div>
          </div>
          <div className={styles.middleColumn}>
            <div className={styles.profileCard}>
              <div className={styles.profileHeader}>
                <img
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/46aa1a41d9ebfd84ef8f781d62c0331b425fcfbd?placeholderIfAbsent=true"
                  className={styles.profileImage}
                  alt="Profile"
                />
                <div className={styles.profileInfo}>
                  <div className={styles.profileName}>Michelle Baskin</div>
                  <div className={styles.viewProfileLink}>View Profile</div>
                </div>
              </div>
              <div className={styles.gigsTitle}>Gyggs I can help with</div>
              <div className={styles.skillsRow}>
                <div className={styles.skillBadge}>Pet Sitting</div>
                <div className={styles.skillBadge}>Gardening</div>
              </div>
              <div className={styles.skillsRow}>
                <div className={styles.skillBadge}>Shelf Mounting</div>
                <div className={styles.skillBadge}>Grocery Shopping</div>
              </div>
              <div className={styles.peopleNeedHelpTitle}>
                3 People need your help
              </div>
              <div className={styles.helpRequests}>
                <div>
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/e8a83df72b7c252520b59a5d6dc645f3d1172b2a?placeholderIfAbsent=true"
                    className={styles.userAvatar}
                    alt="User 1"
                  />
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/85eb20c0e1070ecd17fb6c271fe32e82d71a0915?placeholderIfAbsent=true"
                    className={styles.userAvatarAlt}
                    alt="User 2"
                  />
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/08a694aef99a460e59d9facecd8f12777d5a36bf?placeholderIfAbsent=true"
                    className={styles.userAvatarAlt}
                    alt="User 3"
                  />
                </div>
                <div className={styles.requestDetailsColumn}>
                  <div className={styles.requestText}>
                    Ariana. A from Thornhill needs a dog sitter
                  </div>
                  <div className={styles.viewTaskDetailLink}>
                    View task detail
                  </div>
                  <div className={styles.requestTextAlt}>
                    Lia.T is from Thornhill needs a grocery Shopper
                  </div>
                  <div className={styles.viewTaskDetailLinkAlt}>
                    View task detail
                  </div>
                  <div className={styles.requestTextAlt}>
                    Wilson. H from Richmondhill needs a furniture assembler
                  </div>
                  <div className={styles.viewTaskDetailLinkAlt}>
                    View task detail
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.rightColumn}>
            <div className={styles.searchBarPlaceholder} />

            <div className={styles.billingSection}>
              <div className={styles.filterSortRow}>
                <div className={styles.filterButtonWrapper}>
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/03d835171130baae7e0c4ae2bea3dbf40c6fce9e?placeholderIfAbsent=true"
                    className={styles.filterIcon}
                    alt="Filter"
                  />
                </div>
                <img
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/379ac40e21f5b849adaa77deb10cb299a1608da4?placeholderIfAbsent=true"
                  className={styles.sortIcon}
                  alt="Sort"
                />
              </div>
              <div className={styles.summaryRow}>
                <div className={styles.summaryItem}>
                  <div className={styles.summaryLabel}>In Progress</div>
                  <div className={styles.summaryValue}>$435.24</div>
                </div>
                <div className={styles.summaryItemAlt}>
                  <div className={styles.summaryLabel}>Available</div>
                  <div className={styles.summaryValue}>$586.12</div>
                </div>
                <button className={styles.withdrawButton}>Withdraw</button>
              </div>
              <div className={styles.billingSeparator} />
              <div className={styles.tableHeader}>
                <div className={styles.tableHeaderItem}>Hired by</div>
                <div className={styles.tableHeaderItem}>Date</div>
                <div className={styles.tableHeaderItemDetail}>
                  Contract detail
                </div>
                <div className={styles.tableHeaderItem}>Invoice</div>
              </div>
              <div className={styles.billingSeparatorAlt} />
              {[1, 2, 3, 4, 5].map((_, index) => (
                <React.Fragment key={index}>
                  <div className={styles.tableRow}>
                    <div className={styles.tableCell}>Justin.S</div>
                    <div className={styles.tableCell}>Jun,24,2025</div>
                    <div className={styles.tableCellDetail}>
                      Dog sitting for the weekend...
                    </div>
                    <div className={styles.tableCellInvoice}>View</div>
                  </div>
                  <div className={styles.tableRowSeparator} />
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingDashboardPage;
